import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Room from '../pages/Room'
import Layout from './Layout'

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<Home />} />
          <Route path='/room/:code' element={<Room />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default Router