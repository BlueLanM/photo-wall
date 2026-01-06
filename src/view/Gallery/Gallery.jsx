import { useMemo } from "react";
import BounceCards from "../BounceCards/BounceCards";
import "./Gallery.css";
import image1 from "../../assets/love1.jpg";
import image2 from "../../assets/100day.jpg";
import image3 from "../../assets/love2.jpg";
import image4 from "../../assets/200day.jpg";
import image5 from "../../assets/love3.jpg";
import image6 from "../../assets/300day.jpg";

// 图片配置常量
const GALLERY_CONFIG = {
	title: "LOVE",
	animationDelay: 0.1,
	animationStagger: 0.1,
};

// 图片数据配置
const IMAGES_DATA = [
	{ src: image1, alt: "Love moment 1", id: "love-1" },
	{ src: image2, alt: "100 days together", id: "100day" },
	{ src: image3, alt: "Love moment 2", id: "love-2" },
	{ src: image4, alt: "200 days together", id: "200day" },
	{ src: image5, alt: "Love moment 3", id: "love-3" },
	{ src: image6, alt: "300 days together", id: "300day" },
];

export default function Gallery() {
	// 使用 useMemo 缓存图片数组,避免每次渲染重新创建
	const images = useMemo(() => IMAGES_DATA.map(img => img.src), []);

	return (
		<div className="gallery-container">
			<header className="gallery-header">
				<h1 className="gallery-title">{GALLERY_CONFIG.title}</h1>
			</header>

			<main className="gallery-content">
				<BounceCards
					images={images}
					enableHover
					animationDelay={GALLERY_CONFIG.animationDelay}
					animationStagger={GALLERY_CONFIG.animationStagger}
					className="custom-bounceCards"
				/>
			</main>
		</div>
	);
}