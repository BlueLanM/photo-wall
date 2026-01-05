import BounceCards from "./view/BounceCards/BounceCards";
import "./App.css";

const images = [
	"https://picsum.photos/400/400?grayscale",
	"https://picsum.photos/500/500?grayscale",
	"https://picsum.photos/600/600?grayscale",
	"https://picsum.photos/700/700?grayscale",
	"https://picsum.photos/300/300?grayscale"
];

const transformStyles = [
	"rotate(5deg) translate(-150px)",
	"rotate(0deg) translate(-70px)",
	"rotate(-5deg)",
	"rotate(5deg) translate(70px)",
	"rotate(-5deg) translate(150px)"
];

function App() {
	return (
		<div className="App">
			<BounceCards
				images={images}
				transformStyles={transformStyles}
				enableHover
				animationDelay={0.1}
				animationStagger={0.1}
				className="custom-bounceCards"
			/>
		</div>
	);
}

export default App;