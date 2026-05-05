import { QdrantClient } from '@qdrant/js-client-rest';
import { QDRANT_CONFIG } from '../utils/appConfig';

class VectorDbProvider {

    private client: QdrantClient | null = null
    static _instance: VectorDbProvider

    private constructor() {
        const { url, apiKey } = QDRANT_CONFIG
        this.client = new QdrantClient({ url, apiKey })
    }

    static getInstance(): VectorDbProvider {
        if (!VectorDbProvider._instance) {
            VectorDbProvider._instance = new VectorDbProvider()
        }
        return VectorDbProvider._instance

    }


}

const vectorDbProvider = VectorDbProvider.getInstance()
export { VectorDbProvider }
export default vectorDbProvider