const AudioManager = {
    ctx: null,
    masterGain: null,
    tempo: 100, // BPM
    nextNoteTime: 0,
    isPlaying: false,
    timerID: null,
    lookahead: 25.0, // ms
    scheduleAheadTime: 0.1, // s
    currentBeat: 0,

    // Music track support
    audioElement: null,
    currentTrackFile: null,
    useSynthesized: true,

    init: function () {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.5;
            this.masterGain.connect(this.ctx.destination);
        } catch (e) {
            console.error("Web Audio API not supported", e);
        }
    },

    resume: function () {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    startMusic: function () {
        if (!this.ctx) this.init();
        this.resume();

        if (this.useSynthesized) {
            // Use synthesized drum beat
            if (this.isPlaying) return;

            this.isPlaying = true;
            this.currentBeat = 0;
            this.nextNoteTime = this.ctx.currentTime + 0.1;
            this.scheduler();
        } else {
            // Use audio file
            if (this.audioElement && !this.audioElement.paused) return;
            if (this.audioElement) {
                this.audioElement.currentTime = 0;
                this.audioElement.play().catch(e => console.error("Audio play failed:", e));
            }
        }
    },

    stopMusic: function () {
        this.isPlaying = false;
        if (this.timerID) clearTimeout(this.timerID);
        if (this.audioElement && !this.audioElement.paused) {
            this.audioElement.pause();
        }
    },

    scheduler: function () {
        if (!this.isPlaying) return;

        while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.currentBeat, this.nextNoteTime);
            this.nextNote();
        }

        this.timerID = setTimeout(() => this.scheduler(), this.lookahead);
    },

    nextNote: function () {
        const secondsPerBeat = 60.0 / this.tempo;
        this.nextNoteTime += secondsPerBeat; // Quarter note
        this.currentBeat++;
        if (this.currentBeat === 4) this.currentBeat = 0;
    },

    scheduleNote: function (beatNumber, time) {
        // Simple Kick-Hat-Snare-Hat loop
        if (beatNumber === 0) {
            this.playDrum("kick", time);
        } else if (beatNumber === 2) {
            this.playDrum("snare", time);
        } else {
            this.playDrum("hat", time);
        }
    },

    playDrum: function (type, time) {
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        const now = time || this.ctx.currentTime;

        if (type === "kick") {
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.5);
            gain.gain.setValueAtTime(1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        } else if (type === "snare") {
            osc.type = "triangle";
            osc.frequency.setValueAtTime(100, now);
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

            // Noise for snare
            const noiseNode = this.createNoiseBuffer();
            const noiseGain = this.ctx.createGain();
            noiseNode.buffer = this.noiseBuffer;
            noiseNode.connect(noiseGain);
            noiseGain.connect(this.masterGain);
            noiseGain.gain.setValueAtTime(0.4, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            noiseNode.start(now);
            noiseNode.stop(now + 0.2);

            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === "hat") {
            // High pass noise
            const noiseNode = this.createNoiseBuffer();
            const noiseGain = this.ctx.createGain();
            noiseNode.buffer = this.noiseBuffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = "highpass";
            filter.frequency.value = 5000;

            noiseNode.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(this.masterGain);

            noiseGain.gain.setValueAtTime(0.3, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            noiseNode.start(now);
            noiseNode.stop(now + 0.05);
        }
    },

    playKick: function () {
        this.playDrum("kick"); // Immediate kick for sipa hit
    },

    playPerfect: function () {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain);

        const now = this.ctx.currentTime;
        // Pleasant major chord or high ping
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, now); // A5
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        osc.start(now);
        osc.stop(now + 0.5);
    },

    playMiss: function () {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain);

        const now = this.ctx.currentTime;
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.3);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.start(now);
        osc.stop(now + 0.3);
    },

    playExplosion: function () {
        if (!this.ctx) return;

        // Low rumble + noise burst for explosion
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain);

        const now = this.ctx.currentTime;
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(60, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.5);

        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        osc.start(now);
        osc.stop(now + 0.5);

        // Add noise burst
        const noiseNode = this.createNoiseBuffer();
        const noiseGain = this.ctx.createGain();
        noiseNode.buffer = this.noiseBuffer;
        noiseNode.connect(noiseGain);
        noiseGain.connect(this.masterGain);

        noiseGain.gain.setValueAtTime(0.6, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        noiseNode.start(now);
        noiseNode.stop(now + 0.4);
    },

    loadTrack: function (filename) {
        // Stop current music
        this.stopMusic();

        if (!filename) {
            // Switch to synthesized
            this.useSynthesized = true;
            this.currentTrackFile = null;
            if (this.audioElement) {
                this.audioElement.pause();
                this.audioElement = null;
            }
        } else {
            // Switch to file-based
            this.useSynthesized = false;
            this.currentTrackFile = filename;

            // Create or update audio element
            if (!this.audioElement) {
                this.audioElement = new Audio();
                this.audioElement.loop = true;
                this.audioElement.volume = 0.5;
            }

            this.audioElement.src = `/music/${filename}`;
            this.audioElement.load();
        }
    },

    noiseBuffer: null,
    createNoiseBuffer: function () {
        if (this.noiseBuffer) return this.ctx.createBufferSource();
        const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        this.noiseBuffer = buffer;
        return this.ctx.createBufferSource();
    }
};
