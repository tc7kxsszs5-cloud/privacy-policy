import { router } from './trpc'
import { carsList } from './routes/cars/list'
import { carsGet } from './routes/cars/get'
import { carsBrands } from './routes/cars/brands'

export const appRouter = router({
  cars: router({
    list: carsList,
    get: carsGet,
    brands: carsBrands,
  }),
})

export type AppRouter = typeof appRouter
