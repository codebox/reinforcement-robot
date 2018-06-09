# Reinforcement Robot!
This grid lets you experiment with a Reinforcement Learning technique called
[Value Iteration](https://en.wikipedia.org/wiki/Markov_decision_process#Value_iteration).
Populate the grid by adding in Robots, Blocks and Goals, and by adjusting the numeric values in each cell
(you can update multiple cells at once, just select them by clicking or dragging the mouse). You can also pick
one of the ready-made grids listed down the right-hand side.

[Try it out online here](https://codebox.net/pages/reinforcement-learning-grid-world)

![Screenshot](https://codebox.net/graphics/robot-grid.png)

When you click **Start** the robots will begin to move around the grid. Each robot has a score associated with it -
a robot's objective is to increase its score as much as possible. When a robot moves to a new cell, its score is
adjusted by the value shown at that location in the grid, so obviously robots prefer moving to high-valued green
cells rather than low-valued red ones. There is a small fixed cost for each move that a robot makes (usually just 1 point),
so unless a robot finds a green square its score will get lower each time it moves.

Robots cannot move through **Blocks**, these are simply obstacles that robots will avoid when moving around.

If a robot moves into a **Goal**, then the robot will be removed from the grid and its score will stop changing.
Depending on what the grid looks like, robots may either seek out goals, or avoid them. If there are no green squares
on the grid a robot will try to get to a goal as quickly as possible, in order to prevent its score from dropping any
further than necessary. If there are green squares available, then a robot may determine that by remaining on the grid
it can accumulate a positive score, and so it will avoid moving into a goal.

The movement strategy that a robot uses is referred to as its **Policy**. All robots on the grid share the same policy,
which can be displayed by clicking the **Show Policy** button. The arrows in each cell show which direction a robot will move,
if it finds itself in that location. If a cell has multiple arrows then one of those directions is chosen at random.

The **Policy Rounds** value determines how far into the future the robots will look, when trying to determine the best policy.
Complex grids require a higher number of rounds - try selecting the predefined **Maze** grid from the list on the right, and
then adjust the number of rounds to see how the policy changes.

The **Move Cost** value determines the number of points that are deducted from a robot's score each time it moves. A high Move Cost
makes it more likely that robots will seek out locations that contain Goals, so that they can exit the grid and stop incurring
a cost for each move that they make. Setting the Move Cost to zero allows the robots to move around for free.

