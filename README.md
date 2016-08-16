# Bat-Man
A clone of the popular arcade game Pac-Man, with an awesome Batman theme.

[Bat-Man Live](https://bat-man.herokuapp.com)

### Features and Gameplay
1. The streets of Gotham City, a randomly generated closed-loop maze in which the game takes place.
2. A Batman-themed Pac-Man character, controlled by the player using the arrow keys. He traverses the maze collecting the mini Batman logos that add to his score. The player beats the level when all Batman logos have been collected.
3. Four enemy characters that move about the maze. The player loses if Batman occupies the same maze tile as any of these characters, provided the bat signal is not currently shining over the streets of Gotham City. The enemies are:
  1. Joker - Moves randomly throughout the maze. Moves at 100% of Batman's speed.
  2. Bane - Attempts to position himself behind Batman and chase him throughout the maze. Moves at 90% of Batman's speed.
  3. Riddler - Moves away from Batman. Moves at 90% of Batman's speed
  4. Penguin - Attempts to position himself in front of Batman until he comes within 10 tiles of Batman, then flees. Moves at 110% of Batman's speed.
4. Four larger blinking Batman logos, positioned near the corners of the maze. Collecting these activate the bat signal for 20 seconds, which reduces each enemy's move speed by 10%, causes them to become vulnerable to Batman, and forces them to head towards Arkham Asylum. This area is located at the center of the maze, and is not accessible to Batman.
5. When an enemy is attacked by Batman (occupies the same maze tile as Batman while the bat signal is activated), their eyes quickly scurry to Arkham Asylum, where they remain for the duration of the bat signal. Once the bat signal goes out, their bodies are restored and they re-enter the maze.

### Wireframes
[View wireframes](./docs/wireframes/)

### Timeline
#### Phase 1
- [ ] Maze, Batman, and Enemy creation
- [ ] User input and logo consumption
- [ ] UI framework (Title, Controls, Remaining Lives, High Scores)

#### Phase 2
- [ ] Scoring based on Batman logo consumption, enemies attacked
- [ ] Decreased bat signal duration based on level
- [ ] Active bat signal mode
- [ ] Attacking and being attacked by enemies

#### Phase 3
- [ ] Game Over screen for when Batman is attacked without the bat signal active
- [ ] Victory screen for when all Batman logos have been cleared
- [ ] High score screen (cookies)
- [ ] Music and sound effects with mute button
