'use strict'
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value)
                  })
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value))
                } catch (e) {
                    reject(e)
                }
            }
            function rejected(value) {
                try {
                    step(generator['throw'](value))
                } catch (e) {
                    reject(e)
                }
            }
            function step(result) {
                result.done
                    ? resolve(result.value)
                    : adopt(result.value).then(fulfilled, rejected)
            }
            step(
                (generator = generator.apply(thisArg, _arguments || [])).next(),
            )
        })
    }
const debug = require('debug')
const logger = debug('core')
const delays = [...Array(50)].map(() => Math.floor(Math.random() * 900) + 100)
const load = delays.map(
    delay => () =>
        new Promise(resolve => {
            setTimeout(() => resolve(Math.floor(delay / 100)), delay)
        }),
)
const throttle = (workers, tasks) =>
    __awaiter(void 0, void 0, void 0, function* () {
        const results = []
        const executeTask = task =>
            __awaiter(void 0, void 0, void 0, function* () {
                const result = yield task()
                results.push(result)
            })
        const executeWorkers = () =>
            __awaiter(void 0, void 0, void 0, function* () {
                const workerPromises = []
                const runTask = () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        if (tasks.length > 0) {
                            const task = tasks.shift()
                            const result = yield executeTask(task)
                            return result
                        }
                    })
                for (let i = 0; i < workers; i++) {
                    workerPromises.push(runTask())
                }
                yield Promise.all(workerPromises)
            })
        yield executeWorkers()
        return results
    })
const bootstrap = () =>
    __awaiter(void 0, void 0, void 0, function* () {
        logger('Starting...')
        const start = Date.now()
        const answers = yield throttle(5, load)
        logger('Done in %dms', Date.now() - start)
        logger('Answers: %O', answers)
    })
bootstrap().catch(err => {
    logger('General fail: %O', err)
})
