class AnalyticsService {
    private static _instance: AnalyticsService | null = null
    private constructor() {
        if (AnalyticsService._instance) {
            return AnalyticsService._instance
        }

    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new AnalyticsService()
        }
    }

}