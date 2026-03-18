import { router } from './trpc'
import { carsList } from './routes/cars/list'
import { carsGet } from './routes/cars/get'

export const appRouter = router({
  cars: router({
    list: carsList,
    get: carsGet,
  }),
})

export type AppRouter = typeof appRouter
