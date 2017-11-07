
class Timer {

    constructor(duration, tickCount) {
        this.duration = duration;
        this.tickCount = tickCount;

        this.tickCallback = (progress) => {};
        this.beforeActionCallback = () => {};
        this.asyncActionCallback = (onCompletion) => {};
    }

    startLoop() {
        let executeAction = () => {
            this.beforeActionCallback();
            this.asyncActionCallback(() => {

                this._startOne(() => {
                    executeAction();
                });
            });
        };
        executeAction();
    }

    _startOne(onFinishCallback) {
        let deadline = Date.now() + this.duration;
        this.timerId = setInterval(() => {

            let remainingTime = deadline - Date.now();
            let progress = (this.duration - remainingTime) / this.duration;
            progress = Math.max(Math.min(progress, 1.0), 0.0);
            this.tickCallback(progress);

            if (remainingTime <= 0) {
                onFinishCallback();
                clearInterval(this.timerId);
            }
        }, this.duration / this.tickCount);
    }

    invalidate() {
        if (this.timerId) {
            clearInterval(this.timerId);
        }
    }
}

Timer.prototype.onTick = function(callback) {
    this.tickCallback = callback;
    return this;
};
Timer.prototype.onBeforeAction = function(callback) {
    this.beforeActionCallback = callback;
    return this;
};
Timer.prototype.setAsyncAction = function(callback) {
    this.asyncActionCallback = callback;
    return this;
};