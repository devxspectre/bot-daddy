class AnalyticsService {
    private static _instance: AnalyticsService | null = null
    private constructor() {

    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new AnalyticsService()
        }
    }

}