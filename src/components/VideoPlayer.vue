<template>
    <div class="video-container">
        <iframe
            width="100%"
            height="500"
            :src="video ? video : null"
            frameborder="0"
            allow="autoplay; encrypted-media"
            allowfullscreen
        ></iframe>
    </div>
</template>

<script>
export default {
    name: "VideoPlayer",
    data() {
        return {};
    },
    props: {
        video: String
    },
    computed: {
        activeVideo() {
            let activeVideo = null;
            if (this.videoId) {
                let index = this.videos.findIndex(vid => {
                    return (vid.id == this.videoId);
                });
                console.log('index='+index);
                if (index>-1) activeVideo = this.videos[index];
            }
            return activeVideo
        }
    }
};
</script>

<style scoped>
</style>