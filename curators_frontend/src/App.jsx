import {Route, Routes} from "react-router-dom";
import SubmissionDetailPage from "./pages/SubmissionDetailPage.jsx";
import SubmissionListPage from "./pages/SubmissionListPage.jsx";

const App = () => (
  <Routes>
    <Route path="/" element={<SubmissionListPage />} />
    <Route
      path="/submissions/:brokerSubmissionId"
      element={<SubmissionDetailPage />}
    />
  </Routes>
);

export default App;
