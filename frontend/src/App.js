import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import SearchResultsPage from "@/pages/SearchResultsPage";
import NameSearchResultsPage from "@/pages/NameSearchResultsPage";

function App() {
  return (
    <div className="App min-h-screen bg-white">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="urun/:model" element={<ProductDetailPage />} />
            <Route path="ara" element={<SearchResultsPage />} />
            <Route path="ara-urun" element={<NameSearchResultsPage />} />
            <Route path="kategori/:category" element={<HomePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
