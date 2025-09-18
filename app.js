document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const elements = {
        searchBtn: document.getElementById('searchBtn'),
        searchQuery: document.getElementById('searchQuery'),
        searchError: document.getElementById('searchError'),
        loadingIndicator: document.getElementById('loadingIndicator'),
        resultCard: document.getElementById('resultCard'),
        videoThumbnail: document.getElementById('videoThumbnail'),
        videoTitle: document.getElementById('videoTitle'),
        videoDuration: document.getElementById('videoDuration'),
        videoChannel: document.getElementById('videoChannel'),
        videoViews: document.getElementById('videoViews'),
        downloadVideoBtn: document.getElementById('downloadVideoBtn'),
        downloadAudioBtn: document.getElementById('downloadAudioBtn'),
        previewBtn: document.getElementById('previewBtn'),
        downloadLoading: document.getElementById('downloadLoading'),
        downloadMessage: document.getElementById('downloadMessage'),
        downloadError: document.getElementById('downloadError'),
        downloadSuccess: document.getElementById('downloadSuccess'),
        successMessage: document.getElementById('successMessage'),
        previewPlayer: document.getElementById('previewPlayer'),
        audioPlayer: document.getElementById('audioPlayer'),
        playBtn: document.getElementById('playBtn'),
        progressContainer: document.getElementById('progressContainer'),
        progressBar: document.getElementById('progressBar'),
        currentTime: document.getElementById('currentTime')
    };

    let currentVideo = null;
    let isPlaying = false;

    // Event Listeners
    elements.searchBtn.addEventListener('click', searchYouTube);
    elements.downloadVideoBtn.addEventListener('click', () => downloadMedia('video'));
    elements.downloadAudioBtn.addEventListener('click', () => downloadMedia('audio'));
    elements.previewBtn.addEventListener('click', previewAudio);
    elements.playBtn.addEventListener('click', togglePlay);
    elements.progressContainer.addEventListener('click', setProgress);

    // Audio player events
    elements.audioPlayer.addEventListener('play', () => {
        isPlaying = true;
        elements.playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    });
    
    elements.audioPlayer.addEventListener('pause', () => {
        isPlaying = false;
        elements.playBtn.innerHTML = '<i class="fas fa-play"></i>';
    });
    
    elements.audioPlayer.addEventListener('timeupdate', updateProgress);
    elements.audioPlayer.addEventListener('ended', () => {
        isPlaying = false;
        elements.playBtn.innerHTML = '<i class="fas fa-play"></i>';
    });

    // Search YouTube function
    async function searchYouTube() {
        const query = elements.searchQuery.value.trim();
        
        if (!query) {
            showError(elements.searchError, 'Please provide a search query!');
            return;
        }
        
        clearError(elements.searchError);
        hideElement(elements.resultCard);
        hideElement(elements.previewPlayer);
        showElement(elements.loadingIndicator);
        
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to search');
            }
            
            currentVideo = data;
            displayVideoInfo(data);
            
            hideElement(elements.loadingIndicator);
            showElement(elements.resultCard);
            
        } catch (error) {
            hideElement(elements.loadingIndicator);
            showError(elements.searchError, error.message);
            console.error('Search error:', error);
        }
    }
    
    // Download media function
    async function downloadMedia(type) {
        if (!currentVideo) return;
        
        showElement(elements.downloadLoading);
        elements.downloadMessage.textContent = `Preparing ${type} download...`;
        hideElement(elements.downloadSuccess);
        clearError(elements.downloadError);
        
        try {
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = `/api/download?url=${encodeURIComponent(currentVideo.url)}&type=${type}`;
            a.download = `${currentVideo.title.replace(/[^\w\s]/gi, '')}.${type === 'audio' ? 'mp3' : 'mp4'}`;
            
            // Track download start
            let downloadStarted = false;
            window.addEventListener('blur', function onBlur() {
                downloadStarted = true;
                window.removeEventListener('blur', onBlur);
            });
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Show success message after a delay
            setTimeout(() => {
                if (downloadStarted) {
                    showDownloadSuccess(type);
                }
                hideElement(elements.downloadLoading);
            }, 3000);
            
        } catch (error) {
            hideElement(elements.downloadLoading);
            showError(elements.downloadError, error.message);
            console.error('Download error:', error);
        }
    }
    
    // Preview audio function
    async function previewAudio() {
        if (!currentVideo) return;
        
        showElement(elements.downloadLoading);
        elements.downloadMessage.textContent = 'Loading preview...';
        clearError(elements.downloadError);
        
        try {
            const response = await fetch(`/api/preview?url=${encodeURIComponent(currentVideo.url)}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to load preview');
            }
            
            elements.audioPlayer.src = data.previewUrl;
            showElement(elements.previewPlayer);
            hideElement(elements.downloadLoading);
            
        } catch (error) {
            hideElement(elements.downloadLoading);
            showError(elements.downloadError, error.message);
            console.error('Preview error:', error);
        }
    }
    
    // Audio player controls
    function togglePlay() {
        if (isPlaying) {
            elements.audioPlayer.pause();
        } else {
            elements.audioPlayer.play();
        }
    }
    
    function updateProgress() {
        const { duration, currentTime } = elements.audioPlayer;
        const progressPercent = (currentTime / duration) * 100;
        elements.progressBar.style.width = `${progressPercent}%`;
        elements.currentTime.textContent = formatTime(currentTime);
    }
    
    function setProgress(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = elements.audioPlayer.duration;
        elements.audioPlayer.currentTime = (clickX / width) * duration;
    }
    
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    // Show download success
    function showDownloadSuccess(type) {
        elements.successMessage.textContent = 
            `${type === 'audio' ? 'MP3' : 'MP4'} downloaded successfully! Check your downloads folder.`;
        showElement(elements.downloadSuccess);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            hideElement(elements.downloadSuccess);
        }, 5000);
        
        // Optional vibration
        if (navigator.vibrate) navigator.vibrate(200);
    }
    
    // Display video info
    function displayVideoInfo(video) {
        elements.videoThumbnail.src = video.thumbnail;
        elements.videoTitle.textContent = video.title;
        elements.videoDuration.textContent = video.duration;
        elements.videoChannel.textContent = video.channel;
        elements.videoViews.textContent = video.views;
    }
    
    // Helper functions
    function showError(element, message) {
        element.textContent = message;
        element.style.display = 'block';
    }
    
    function clearError(element) {
        element.textContent = '';
        element.style.display = 'none';
    }
    
    function showElement(element) {
        element.style.display = 'block';
    }
    
    function hideElement(element) {
        element.style.display = 'none';
    }
});
