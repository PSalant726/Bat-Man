# Pac-Man
A clone of the popular arcade game Pac-Man.

[Pac-Man Live](https://pac-man.philsalant.com)

## Features and Gameplay
1. A randomly generated closed-loop maze in which the game takes place.
2. A Pac-Man character, controlled by the player using the arrow keys. He traverses the maze collecting the dots that add to his score. The player beats the level when all dots have been collected.
3. Four enemy characters that move about the maze. The player loses if Pac-Man occupies the same maze tile as any of these characters, provided a large dot has not been recently collected. The enemies are:
  1. Inky - Moves randomly throughout the maze. Moves at 100% of Pac-Man's speed.
  2. Blinky - Attempts to position himself behind Pac-Man and chase him throughout the maze. Moves at 90% of Pac-Man's speed.
  3. Pinky - Moves away from Pac-Man. Moves at 90% of Pac-Man's speed
  4. Dot - Attempts to position himself in front of Pac-Man until he comes within 10 tiles of Pac-Man, then flees until he is 30 tiles away from Pac-Man. Moves at 110% of Pac-Man's speed.
4. Four larger blinking dots, positioned near the corners of the maze. Collecting these activate enemy vulnerability mode for 20 seconds, which reduces each enemy's move speed by 10%, causes them to become vulnerable to Pac-Man, and forces them to head towards the jail. This area is located at the center of the maze, and is not accessible to Pac-Man.
5. When an enemy is attacked by Pac-Man (occupies the same maze tile as Pac-Man while vulnerability mode is activated), their eyes quickly scurry to the jail, where they remain for the duration of vulnerability mode. Once vulnerability mode ends, their bodies are restored and they re-enter the maze.

## Wireframes
[View wireframes](./assets/wireframes/)

## Technologies and Techniques Used
- HTML5 Canvas
- JavaScript
- Object-Oriented Programming

## Timeline
#### Phase 1
- [x] Maze, Pac-Man, and Enemy creation
- [x] User input and dot consumption
- [ ] UI framework (Title, Controls, Remaining Lives, High Scores)

#### Phase 2
- [x] Scoring based on dot consumption, enemies attacked
- [ ] Decreased vulnerability mode duration based on level
- [x] Active vulnerability mode
- [x] Attacking and being attacked by enemies

#### Phase 3
- [x] Game Over screen for when Pac-Man is attacked without vulnerability mode active
- [x] Victory screen for when all dots have been cleared
- [ ] High score screen (cookies)
- [x] Music and sound effects with mute button
