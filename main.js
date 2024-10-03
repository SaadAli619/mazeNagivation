import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(120, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 50;
camera.position.y = 70;
camera.rotation.x = -Math.PI / 2;

// Maze building logic function
function generateMaze(width, height) {
    const maze = Array.from({ length: height }, () => Array(width).fill(0));
    const visited = new Set();
    const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];

    function isInBounds(x, y) {
        return x >= 0 && y >= 0 && x < width && y < height;
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function carvePassages(x, y) {
        visited.add(`${x},${y}`);
        maze[y][x] = 1; // Mark as path

        shuffleArray(directions);
        for (const [dx, dy] of directions) {
            const nx = x + dx * 2;
            const ny = y + dy * 2;

            if (isInBounds(nx, ny) && !visited.has(`${nx},${ny}`)) {
                maze[y + dy][x + dx] = 1;
                carvePassages(nx, ny);
            }
        }
    }

    carvePassages(0, 0); //top-left, starting point
    return maze;
}

const maze = generateMaze(21, 21); //how big the maze is

// Rendering of the maze
function renderMaze(maze) {
    const wallMaterial = new THREE.MeshBasicMaterial({ color: 'lightblue' });
    const pathMaterial = new THREE.MeshBasicMaterial({ color: 'black' });
    const boxSize = 4;

    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            const value = maze[y][x];
            const geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
            let cube;

            if (value === 0) { // Wall
                cube = new THREE.Mesh(geometry, wallMaterial);
            } else { // Path
                cube = new THREE.Mesh(geometry, pathMaterial);
            }

            cube.position.set(x * boxSize, 0, y * boxSize);
            scene.add(cube);
        }
    }

    
    addBorders(maze.length, maze[0].length, boxSize, wallMaterial);
}

// Add borders around the maze
function addBorders(mazeHeight, mazeWidth, boxSize, wallMaterial) {
    const geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);

    // Top and bottom borders 
    for (let x = -1; x <= mazeWidth; x++) {
        let topBorder = new THREE.Mesh(geometry, wallMaterial);
        topBorder.position.set(x * boxSize, 0, -1 * boxSize); //position set
        scene.add(topBorder);

        let bottomBorder = new THREE.Mesh(geometry, wallMaterial);
        bottomBorder.position.set(x * boxSize, 0, mazeHeight * boxSize);
        scene.add(bottomBorder);
    }

    // Left and right borders |  |
    for (let y = 0; y < mazeHeight; y++) {
        let leftBorder = new THREE.Mesh(geometry, wallMaterial);
        leftBorder.position.set(-1 * boxSize, 0, y * boxSize); //pos set
        scene.add(leftBorder);

        let rightBorder = new THREE.Mesh(geometry, wallMaterial);
        rightBorder.position.set(mazeWidth * boxSize, 0, y * boxSize);
        scene.add(rightBorder);
    }
}

// Player setup
const playerRadius = 2;
const playerGeometry = new THREE.SphereGeometry(playerRadius, 20, 20);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 'pink' });
const player = new THREE.Mesh(playerGeometry, playerMaterial);

// player pos top left (starting point)
const boxSize = 4;
player.position.set(0, playerRadius, 0); // Place at maze start
scene.add(player);

// Player movement logic
let moveX = 0;
let moveZ = 0;

function movePlayer() {
    const nextX = player.position.x + moveX * boxSize;
    const nextZ = player.position.z + moveZ * boxSize;

    const mazeX = Math.round(nextX / boxSize);
    const mazeZ = Math.round(nextZ / boxSize);

    // Check if the next position is a path, val 1 in maze array
    if (maze[mazeZ] && maze[mazeZ][mazeX] === 1) {
        player.position.x = nextX;
        player.position.z = nextZ;
    }

    moveX = 0;
    moveZ = 0;
}

// event listener for movement

document.addEventListener('keydown', (event) => {
    if (event.key === 'w') {
        moveZ = -1; // ^
    }
    if (event.key === 's') {
        moveZ = 1; // v
    }
    if (event.key === 'a') {
        moveX = -1; // <
    }
    if (event.key === 'd') {
        moveX = 1; // >
    }
});

renderMaze(maze);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    movePlayer(); 
    renderer.render(scene, camera);
}

animate();
