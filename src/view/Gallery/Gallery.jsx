import BounceCards from "../BounceCards/BounceCards";
import "./Gallery.css";

const images = [
	"https://bluelanm.github.io/my-website/assets/images/love5-dc60da6911bfe47c236fac38efae9c59.jpg",
	"https://bluelanm.github.io/my-website/assets/images/100day-c72b8826793f756550401272013ae989.jpg",
	"https://bluelanm.github.io/my-website/assets/images/love7-74dbe379a16a37e4906e9faffb749269.jpg",
	"https://bluelanm.github.io/my-website/assets/images/200day-721dd5edc2cc9cc28ffccb15b14a6113.jpg",
	"https://bluelanm.github.io/my-website/assets/images/love8-2921751412fc55d29df743ce1df9dc74.jpg",
	"https://bluelanm.github.io/my-website/assets/images/300day-63f0684761df1eee48999728e14231f8.jpg"
];

export default function Gallery() {
	return (
		<div className="gallery-container">
			<h1>Photo Gallery</h1>
			<div className="gallery-content">
				<BounceCards
					images={images}
					enableHover
					animationDelay={0.1}
					animationStagger={0.1}
					className="custom-bounceCards"
				/>
			</div>
		</div>
	);
}