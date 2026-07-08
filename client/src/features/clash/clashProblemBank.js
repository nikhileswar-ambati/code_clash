export const clashProblemBank = [
  {
    id: "clash-two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    topics: "Array, Hash Table",
    description:
      "Given an array of integers and a target value, find the indices of two different elements whose sum is equal to the target. Each test case has exactly one valid answer.",
    inputFormat:
      "The first line contains n. The second line contains n space-separated integers. The third line contains target.",
    outputFormat: "Print the two zero-based indices in increasing order, separated by one space.",
    constraints: "2 <= n <= 100000; -1000000000 <= nums[i], target <= 1000000000.",
    explanation:
      "For nums = [2, 7, 11, 15] and target = 9, nums[0] + nums[1] = 9, so the answer is 0 1.",
    starterCode: {
      javascript: `const fs = require("fs");
const input = fs.readFileSync(0, "utf8").trim().split(/\\s+/).map(Number);
let p = 0;
const n = input[p++];
const nums = input.slice(p, p + n);
p += n;
const target = input[p];

// Write your solution here.
`,
      python: `import sys
data = list(map(int, sys.stdin.read().split()))
p = 0
n = data[p]
p += 1
nums = data[p:p+n]
p += n
target = data[p]

# Write your solution here.
`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;
    vector<long long> nums(n);
    for (auto &x : nums) cin >> x;
    long long target;
    cin >> target;

    // Write your solution here.
    return 0;
}
`,
      java: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long[] nums = new long[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextLong();
        long target = sc.nextLong();

        // Write your solution here.
    }
}
`,
    },
    testcases: [
      { input: ["4", "2 7 11 15", "9"], output: ["0 1"] },
      { input: ["3", "3 2 4", "6"], output: ["1 2"] },
      { input: ["2", "3 3", "6"], output: ["0 1"] },
    ],
  },
  {
    id: "clash-valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    topics: "Stack, String",
    description:
      "Given a string containing only bracket characters, determine whether every opening bracket is closed by the same type of bracket and in the correct order.",
    inputFormat: "The first and only line contains the bracket string s.",
    outputFormat: "Print true if the string is valid, otherwise print false.",
    constraints: "1 <= |s| <= 100000; s contains only characters from ()[]{}.",
    explanation:
      "A stack can track opening brackets. When a closing bracket appears, it must match the most recent opening bracket.",
    starterCode: {
      javascript: `const fs = require("fs");
const s = fs.readFileSync(0, "utf8").trim();

// Write your solution here.
`,
      python: `import sys
s = sys.stdin.read().strip()

# Write your solution here.
`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    string s;
    cin >> s;

    // Write your solution here.
    return 0;
}
`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();

        // Write your solution here.
    }
}
`,
    },
    testcases: [
      { input: ["()[]{}"], output: ["true"] },
      { input: ["([)]"], output: ["false"] },
      { input: ["{[]}"], output: ["true"] },
    ],
  },
  {
    id: "clash-maximum-subarray",
    title: "Maximum Subarray",
    difficulty: "Medium",
    topics: "Array, Dynamic Programming",
    description:
      "Given an integer array, find the maximum possible sum of a non-empty contiguous subarray.",
    inputFormat: "The first line contains n. The second line contains n space-separated integers.",
    outputFormat: "Print a single integer: the maximum subarray sum.",
    constraints: "1 <= n <= 200000; -1000000000 <= nums[i] <= 1000000000.",
    explanation:
      "Kadane's algorithm keeps the best subarray ending at the current position and the best answer seen so far.",
    starterCode: {
      javascript: `const fs = require("fs");
const data = fs.readFileSync(0, "utf8").trim().split(/\\s+/).map(Number);
const n = data[0];
const nums = data.slice(1, 1 + n);

// Write your solution here.
`,
      python: `import sys
data = list(map(int, sys.stdin.read().split()))
n = data[0]
nums = data[1:1+n]

# Write your solution here.
`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<long long> nums(n);
    for (auto &x : nums) cin >> x;

    // Write your solution here.
    return 0;
}
`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long[] nums = new long[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextLong();

        // Write your solution here.
    }
}
`,
    },
    testcases: [
      { input: ["9", "-2 1 -3 4 -1 2 1 -5 4"], output: ["6"] },
      { input: ["1", "5"], output: ["5"] },
      { input: ["5", "-5 -2 -8 -1 -4"], output: ["-1"] },
    ],
  },
  {
    id: "clash-search-2d-matrix",
    title: "Search a 2D Matrix",
    difficulty: "Medium",
    topics: "Binary Search, Matrix",
    description:
      "Search for a target value in a matrix where each row is sorted and the first integer of each row is greater than the last integer of the previous row.",
    inputFormat:
      "The first line contains m and n. The next m lines contain n integers each. The last line contains target.",
    outputFormat: "Print true if target exists in the matrix, otherwise print false.",
    constraints: "1 <= m, n <= 300; -1000000000 <= matrix[i][j], target <= 1000000000.",
    explanation:
      "Because the matrix behaves like one sorted array, binary search over indices from 0 to m*n - 1 is sufficient.",
    starterCode: {
      javascript: `const fs = require("fs");
const data = fs.readFileSync(0, "utf8").trim().split(/\\s+/).map(Number);
let p = 0;
const m = data[p++], n = data[p++];
const matrix = [];
for (let i = 0; i < m; i++) {
  matrix.push(data.slice(p, p + n));
  p += n;
}
const target = data[p];

// Write your solution here.
`,
      python: `import sys
data = list(map(int, sys.stdin.read().split()))
p = 0
m, n = data[p], data[p+1]
p += 2
matrix = []
for _ in range(m):
    matrix.append(data[p:p+n])
    p += n
target = data[p]

# Write your solution here.
`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int m, n;
    cin >> m >> n;
    vector<vector<long long>> matrix(m, vector<long long>(n));
    for (auto &row : matrix) for (auto &x : row) cin >> x;
    long long target;
    cin >> target;

    // Write your solution here.
    return 0;
}
`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int m = sc.nextInt(), n = sc.nextInt();
        long[][] matrix = new long[m][n];
        for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) matrix[i][j] = sc.nextLong();
        long target = sc.nextLong();

        // Write your solution here.
    }
}
`,
    },
    testcases: [
      { input: ["3 4", "1 3 5 7", "10 11 16 20", "23 30 34 60", "3"], output: ["true"] },
      { input: ["3 4", "1 3 5 7", "10 11 16 20", "23 30 34 60", "13"], output: ["false"] },
    ],
  },
  {
    id: "clash-longest-consecutive",
    title: "Longest Consecutive Sequence",
    difficulty: "Hard",
    topics: "Hash Set, Array",
    description:
      "Given an unsorted array of integers, return the length of the longest sequence of consecutive values.",
    inputFormat: "The first line contains n. The second line contains n space-separated integers.",
    outputFormat: "Print a single integer: the longest consecutive sequence length.",
    constraints: "0 <= n <= 200000; -1000000000 <= nums[i] <= 1000000000.",
    explanation:
      "Insert all values into a set. A value starts a sequence only when value - 1 is absent; count forward from each start.",
    starterCode: {
      javascript: `const fs = require("fs");
const data = fs.readFileSync(0, "utf8").trim().split(/\\s+/).map(Number);
const n = data[0] || 0;
const nums = data.slice(1, 1 + n);

// Write your solution here.
`,
      python: `import sys
data = list(map(int, sys.stdin.read().split()))
n = data[0] if data else 0
nums = data[1:1+n]

# Write your solution here.
`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<long long> nums(n);
    for (auto &x : nums) cin >> x;

    // Write your solution here.
    return 0;
}
`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long[] nums = new long[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextLong();

        // Write your solution here.
    }
}
`,
    },
    testcases: [
      { input: ["6", "100 4 200 1 3 2"], output: ["4"] },
      { input: ["10", "0 3 7 2 5 8 4 6 0 1"], output: ["9"] },
    ],
  },
  {
    id: "clash-trapping-rain-water",
    title: "Trapping Rain Water",
    difficulty: "Hard",
    topics: "Two Pointers, Prefix Max",
    description:
      "Given non-negative bar heights, compute how much rain water can be trapped after raining.",
    inputFormat: "The first line contains n. The second line contains n space-separated heights.",
    outputFormat: "Print a single integer: the total trapped water.",
    constraints: "1 <= n <= 200000; 0 <= height[i] <= 100000.",
    explanation:
      "At each index, water is limited by the smaller of the maximum height to its left and right. A two-pointer scan can compute this in linear time.",
    starterCode: {
      javascript: `const fs = require("fs");
const data = fs.readFileSync(0, "utf8").trim().split(/\\s+/).map(Number);
const n = data[0];
const height = data.slice(1, 1 + n);

// Write your solution here.
`,
      python: `import sys
data = list(map(int, sys.stdin.read().split()))
n = data[0]
height = data[1:1+n]

# Write your solution here.
`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<long long> height(n);
    for (auto &x : height) cin >> x;

    // Write your solution here.
    return 0;
}
`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long[] height = new long[n];
        for (int i = 0; i < n; i++) height[i] = sc.nextLong();

        // Write your solution here.
    }
}
`,
    },
    testcases: [
      { input: ["12", "0 1 0 2 1 0 1 3 2 1 2 1"], output: ["6"] },
      { input: ["6", "4 2 0 3 2 5"], output: ["9"] },
    ],
  },
];

export function normalizeProblemForClash(problem) {
  return {
    ...problem,
    name: problem.title,
    time_limit_per_test: problem.time_limit_per_test || "2s",
    sampleInputs: problem.testcases?.map((testcase) => testcase.input.join("\n")) || [],
    sampleOutputs: problem.testcases?.map((testcase) => testcase.output.join("\n")) || [],
  };
}
