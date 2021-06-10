const clickSpeedTest = () => {
    return {
        cps: 0,
        cpsMax: 0,
        clicks: 0,
        startTime: 0,
        endTime: 0,


        get time() {
            return new Date().getTime()
        },

        get activeTime() {
            return this.time - this.startTime
        },

        get idleTime() {
            return this.time - this.endTime
        },


        restart() {
            this.clicks = this.cps = this.cpsMax = 0
            this.startTime = this.time
        },

        mouseDown() {
            this.clicks++

            if (this.idleTime > 1000)
                this.restart()

            if (this.activeTime > 100)
                this.cps = this.clicks / this.activeTime * 1000

            if (this.activeTime > 1000)
                this.cpsMax = Math.max(this.cps, this.cpsMax)
        },

        mouseUp() {
            this.endTime = this.time
        },


        nornalize(num, fix = 2) {
            return num.toFixed(fix)
        },

        get activeTimeDisplay() {
            return this.nornalize(this.activeTime / 1000, 1)
        },

        get cpsDisplay() {
            return this.nornalize(this.cps)
        },

        get cpsMaxDisplay() {
            return this.nornalize(this.cpsMax)
        }
    }
}
