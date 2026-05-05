import { Sequelize } from 'sequelize'
import { DATABASE_URL } from '../utils/appConfig'

class DbProvider {
    public client: Sequelize | null = null
    static instance: DbProvider | null = null

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
        if (!DbProvider.instance) {
            DbProvider.instance = new DbProvider()
        }
        return DbProvider.instance
    }

}


export const db = DbProvider.getInstance().client
const dbProvider = DbProvider.getInstance()


export default dbProvider
