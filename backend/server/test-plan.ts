
import { generateCommitPlan } from './git-operations';

const grid: number[][] = Array(7).fill(Array(52).fill(0));
// Set one cell to 1
grid[0][0] = 1;

try {
    console.log("Testing generateCommitPlan...");
    const plan = generateCommitPlan(grid, 2024, 1);
    console.log("Success! Plan generated.");
    console.log("Total commits:", plan.reduce((sum, item) => sum + item.count, 0));
    console.log("First item:", plan[0]);
} catch (error) {
    console.error("Failed:", error);
}
