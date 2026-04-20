import { Sequelize } from 'sequelize'
import { DATABASE_URL } from '../utils/appConfig'

class DbClient {
    public client: Sequelize | null = null
    static instance: DbClient | null = null

    private constructor() {
        this.client = new Sequelize(DATABASE_URL)
    }
    async connect() {
        await this.client?.authenticate()
        console.log('Connected to db')
    }
    async disconnect() {
        await this.client?.close()
        console.log('Db disconnected')
    }
    static getInstance() {
        if (!DbClient.instance) {
            DbClient.instance = new DbClient()
        }
        return DbClient.instance
    }

}


export const db = DbClient.getInstance().client
const dbProvider = DbClient.getInstance()


export default dbProvider
