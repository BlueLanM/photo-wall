import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import PillNav from "./components/PillNav/PillNav";
import Gallery from "./view/Gallery/Gallery";
import DomeGallery from "./view/DomeGallery";
import ImageTrail from "./view/ImageTrail";
import "./App.css";

// 简单的 Logo SVG (可以替换为你自己的 logo 图片)
const logoSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23667eea'/%3E%3Ctext x='50' y='65' font-size='50' text-anchor='middle' fill='white' font-family='Arial'%3EP%3C/text%3E%3C/svg%3E";

const navItems = [
	{ href: "/", label: "Gallery" },
	{ href: "/domegallery", label: "DomeGallery" },
	{ href: "/imagetrail", label: "ImageTrail" }
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
				activeHref={location.pathname}
				initialLoadAnimation={isFirstLoad}
			/>
			<Routes>
				<Route path="/" element={<Gallery />} />
				<Route path="/domegallery" element={<DomeGallery />} />
				<Route path="/imagetrail" element={<ImageTrail />} />
			</Routes>
		</div>
	);
}

export default App;