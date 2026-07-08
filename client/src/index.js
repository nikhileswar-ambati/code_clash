import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import "./index.css"
import { 
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import App from './App';
import ContestForm from './Contests/Contestdetails';
import ContestProblemPage from './pages/contestproblems/[pid]';
import AuthPage from './pages/auth/AuthPage';
import ProblemPage from './pages/problems/[pid]';
import { RecoilRoot } from 'recoil';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ChallengesPage from './Contests/challengelist';
import Select from './Contests/contestselection';
import Hostmain from './Contests/Hostmainpage';
import Questions from './Contests/Questions';
import ClashRoom from './pages/clash/ClashRoom';
import ClashPage from './pages/clash/ClashPage';
import ClashHistory from './pages/clash/ClashHistory';
import ClashLeaderboard from './pages/clash/ClashLeaderboard';

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthPage />,
  },
  {
    path: "/problems",
    element: <App />,
  },
  {
    path: "/questions/:id",
    element: <Questions />,
  },
  {
    path: "/hostcontests/:id",
    element: <Questions />,
  },
  {
    path: "/hostcontests",
    element: <Hostmain />,
  },
  {
    path: "/contests/challenges",
    element: <ChallengesPage />,
  },
  {
    path: "/contests",
    element: <ContestForm/>,
  },
  {
    path: "/learn",
    element: <Navigate to="/problems" replace />,
  },
  {
    path: "/clash",
    element: <ClashPage />,
  },
  {
    path: "/clash/history",
    element: <ClashHistory />,
  },
  {
    path: "/clash/leaderboard",
    element: <ClashLeaderboard />,
  },
  {
    path: "/clash/:clashId",
    element: <ClashRoom />,
  },
  {
    path: "/auth",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/contests/:contestId",
    element: <Select/>
  },
  {
    path: "/contestproblems/:pid",
    element: <ContestProblemPage />,
  },
  {
    path: "/problems/:pid",
    element: <ProblemPage />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RecoilRoot>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
    <ToastContainer/>
  </RecoilRoot>
);

reportWebVitals();
