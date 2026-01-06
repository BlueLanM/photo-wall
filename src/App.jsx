import { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import PillNav from "./components/PillNav/PillNav";
import Gallery from "./view/Gallery/Gallery";
import DomeGallery from "./view/DomeGallery";
import ImageTrail from "./view/ImageTrail";
import "./App.css";

// 简单的 Logo SVG (可以替换为你自己的 logo 图片)
const logoSvg = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='40' fill='%23667eea'/><text x='50' y='60' font-size='30' text-anchor='middle' fill='white' font-family='Arial'>LanM</text></svg>";

const navItems = [
	{ href: "/photo-wall/", label: "纪念日" },
	{ href: "/photo-wall/domegallery", label: "旅行" },
	{ href: "/photo-wall/imagetrail", label: "画作" }
];

function App() {
	const location = useLocation();
	const [isFirstLoad, setIsFirstLoad] = useState(true);

	// 只在组件首次挂载后禁用初始动画
	useEffect(() => {
		if (isFirstLoad) {
			const timer = setTimeout(() => {
				setIsFirstLoad(false);
			}, 1000); // 等待初始动画完成
			return () => clearTimeout(timer);
		}
	}, [isFirstLoad]);

	return (
		<div className="app">
			<PillNav
				logo={logoSvg}
				logoAlt="Photo Wall"
				items={navItems}
				pillColor="#6B7FED"
				baseColor="#FFF"
				hoveredPillTextColor="#6B7FED"
				pillTextColor="#FFF"
				activeHref={location.pathname}
				initialLoadAnimation={isFirstLoad}
			/>
			<Routes>
				<Route path="/" element={<Navigate to="/photo-wall" replace />} />
				<Route path="/photo-wall/" element={<Gallery />} />
				<Route path="/photo-wall/domegallery" element={<DomeGallery />} />
				<Route path="/photo-wall/imagetrail" element={<ImageTrail />} />
			</Routes>
		</div>
	);
}

export default App;