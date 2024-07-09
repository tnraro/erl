import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import { Page as IndexPage } from './routes/index.tsx'
import { Page as Rooms$RoomIdPage } from './routes/rooms.$roomId.tsx'

const router = createBrowserRouter([
  { path: "/", element: <IndexPage /> },
  { path: "/rooms/:roomId", element: <Rooms$RoomIdPage /> },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
