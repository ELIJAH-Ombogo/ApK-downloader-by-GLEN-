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

    // Search YouTube function (stub)
    async function searchYouTube() {
        const query = elements.searchQuery.value.trim();
        
        if (!query) {
            showError(elements.searchError, 'Please provide a YouTube URL!');
            return;
        }
        
        clearError(elements.searchError);
        hideElement(elements.resultCard);
        hideElement(elements.previewPlayer);
        showElement(elements.loadingIndicator);
        
        try {
            // Here we don’t have a search API — assume query is a direct URL
            currentVideo = {
                url: query,
                title: "Detected YouTube Video",
                thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
                duration: "Unknown",
                channel: "Unknown",
                views: "N/A"
            };

            displayVideoInfo(currentVideo);
            
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
            let apis = [];

            if (type === 'video') {
                apis = [
                    `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(currentVideo.url)}`
                ];
            } else {
                apis = [
                    `https://apis.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(currentVideo.url)}`,
                    `https://www.dark-yasiya-api.site/download/ytmp3?url=${encodeURIComponent(currentVideo.url)}`,
                    `https://api.giftedtech.web.id/api/download/dlmp3?url=${encodeURIComponent(currentVideo.url)}&apikey=gifted-md`,
                    `https://api.dreaded.site/api/ytdl/audio?url=${encodeURIComponent(currentVideo.url)}`
                ];
            }

            let success = false;
            for (const api of apis) {
                try {
                    const res = await fetch(api);
                    if (res.ok) {
                        const blob = await res.blob();
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(blob);
                        a.download = `${currentVideo.title.replace(/[^\w\s]/gi, '')}.${type === 'audio' ? 'mp3' : 'mp4'}`;
                        a.click();
                        success = true;
                        break;
                    }
                } catch (err) {
                    console.warn(`API failed: ${api}`, err);
                }
            }

            if (!success) throw new Error("All download APIs failed.");

            showDownloadSuccess(type);
            
        } catch (error) {
            hideElement(elements.downloadLoading);
            showError(elements.downloadError, error.message);
            console.error('Download error:', error);
        } finally {
            hideElement(elements.downloadLoading);
        }
    }
    
    // Preview audio function (fake preview for now)
    async function previewAudio() {
        if (!currentVideo) return;
        
        showElement(elements.downloadLoading);
        elements.downloadMessage.textContent = 'Loading preview...';
        clearError(elements.downloadError);
        
        try {
            // For now, just attach the URL directly (would require API support for previews)
            elements.audioPlayer.src = currentVideo.url;
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
        
        setTimeout(() => {
            hideElement(elements.downloadSuccess);
        }, 5000);
        
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
