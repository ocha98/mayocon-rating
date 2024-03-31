import fs from 'fs'

const RATING_DATA_DIR = process.env.RATING_DATA_DIR || 'data/'

// RATING_DATA_DIR内のjsonファイルを読み込みます
export const loadRatingData = async (): Promise<{month: string, data: UserData[]}[]> => {
    const files = fs.readdirSync(RATING_DATA_DIR)
    const data = files
        .filter((files) => files.endsWith('.json'))
        .map((files) => {
            const json = fs.readFileSync(`${RATING_DATA_DIR}/${files}`, 'utf-8')
            const data: UserData[] = JSON.parse(json)
            return { month: files.replace('.json', ''), data }
        })

    return data
}
