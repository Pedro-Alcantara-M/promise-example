const debug = require('debug')

const logger = debug('core')

interface TaskType {
    (): Promise<number>
}

const delays = [...Array(50)].map(() => Math.floor(Math.random() * 900) + 100)
const load: Array<() => Promise<number>> = delays.map(
    delay => (): Promise<number> =>
        new Promise(resolve => {
            setTimeout(() => resolve(Math.floor(delay / 100)), delay)
        }),
)

const throttle = async (
    workers: number,
    tasks: TaskType[],
): Promise<number[]> => {
    const results: number[] = []

    const executeTask = async (task: TaskType): Promise<void> => {
        const result = await task()
        results.push(result)
    }

    const executeWorkers = async (): Promise<void> => {
        const workerPromises: Promise<void>[] = []

        const runTask = async (): Promise<number | void> => {
            if (tasks.length > 0) {
                const task = tasks.shift()!
                const result = await executeTask(task)

                return result
            }
        }

        for (let i = 0; i < workers; i++) {
            workerPromises.push(runTask() as Promise<void>)
        }

        await Promise.all(workerPromises)
    }

    await executeWorkers()

    return results
}

const bootstrap = async () => {
    logger('Starting...')
    const start = Date.now()
    const answers = await throttle(5, load)
    logger('Done in %dms', Date.now() - start)
    logger('Answers: %O', answers)
}

bootstrap().catch(err => {
    logger('General fail: %O', err)
})
