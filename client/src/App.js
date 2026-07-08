import React, { useMemo, useState } from "react";
import { useRecoilValue } from "recoil";
import Navbar from "./components/Navbar/Navbar";
import AuthModal from "./components/Modals/AuthModal";
import { authModalState } from "./atoms/authModalAtom";
import SharedHero from "./components/SharedHero";

const dsaTopics = [
  {
    topic: "Arrays",
    gfg: "https://www.geeksforgeeks.org/array-data-structure/",
    companies: ["Amazon", "Google", "Microsoft", "Adobe"],
    variants: "prefix/suffix, sorting, hashing, two pointers, in-place updates",
    problems: [
      "Two Sum", "Best Time to Buy and Sell Stock", "Product of Array Except Self", "Maximum Subarray",
      "Merge Intervals", "Insert Interval", "Rotate Array", "Move Zeroes", "Contains Duplicate",
      "Majority Element", "Missing Number", "Find All Numbers Disappeared in an Array",
      "Set Matrix Zeroes", "Spiral Matrix", "Next Permutation", "Sort Colors", "Container With Most Water",
      "Trapping Rain Water", "Subarray Sum Equals K", "First Missing Positive",
    ],
  },
  {
    topic: "Strings",
    gfg: "https://www.geeksforgeeks.org/string-data-structure/",
    companies: ["Google", "Meta", "Amazon", "Bloomberg"],
    variants: "frequency map, palindrome, parsing, rolling window, pattern matching",
    problems: [
      "Valid Anagram", "Valid Palindrome", "Longest Substring Without Repeating Characters", "Group Anagrams",
      "Longest Palindromic Substring", "Palindromic Substrings", "Minimum Window Substring",
      "Permutation in String", "Find All Anagrams in a String", "String to Integer Atoi", "Decode String",
      "Encode and Decode Strings", "Longest Common Prefix", "Reverse Words in a String",
      "Valid Parentheses", "Generate Parentheses", "Simplify Path", "Basic Calculator",
      "Roman to Integer", "Integer to Roman",
    ],
  },
  {
    topic: "Two Pointers",
    gfg: "https://www.geeksforgeeks.org/two-pointers-technique/",
    companies: ["Amazon", "Microsoft", "Meta", "Apple"],
    variants: "opposite ends, fast-slow pointers, partitioning, sorted search",
    problems: [
      "Two Sum II Input Array Is Sorted", "3Sum", "4Sum", "Remove Duplicates from Sorted Array",
      "Remove Element", "Move Zeroes", "Squares of a Sorted Array", "Container With Most Water",
      "Trapping Rain Water", "Valid Palindrome", "Valid Palindrome II", "Merge Sorted Array",
      "Sort Colors", "Linked List Cycle", "Middle of the Linked List", "Palindrome Linked List",
      "Intersection of Two Linked Lists", "Backspace String Compare", "Boats to Save People",
      "Partition Labels",
    ],
  },
  {
    topic: "Sliding Window",
    gfg: "https://www.geeksforgeeks.org/window-sliding-technique/",
    companies: ["Google", "Amazon", "Uber", "Adobe"],
    variants: "fixed window, variable window, frequency window, min/max window",
    problems: [
      "Maximum Average Subarray I", "Minimum Size Subarray Sum", "Longest Substring Without Repeating Characters",
      "Longest Repeating Character Replacement", "Permutation in String", "Find All Anagrams in a String",
      "Minimum Window Substring", "Sliding Window Maximum", "Fruit Into Baskets",
      "Max Consecutive Ones III", "Subarrays with K Different Integers", "Binary Subarrays With Sum",
      "Count Number of Nice Subarrays", "Longest Subarray of 1s After Deleting One Element",
      "Grumpy Bookstore Owner", "Repeated DNA Sequences", "Longest Nice Subarray",
      "Maximum Number of Vowels in a Substring of Given Length", "Number of Substrings Containing All Three Characters",
      "Minimum Operations to Reduce X to Zero",
    ],
  },
  {
    topic: "Hashing",
    gfg: "https://www.geeksforgeeks.org/hashing-data-structure/",
    companies: ["Amazon", "Google", "Microsoft", "Walmart"],
    variants: "set lookup, frequency count, grouping, prefix hash, duplicate detection",
    problems: [
      "Contains Duplicate", "Two Sum", "Valid Anagram", "Group Anagrams", "Top K Frequent Elements",
      "Longest Consecutive Sequence", "Subarray Sum Equals K", "Find All Anagrams in a String",
      "Isomorphic Strings", "Word Pattern", "Happy Number", "Ransom Note", "Jewels and Stones",
      "First Unique Character in a String", "Intersection of Two Arrays", "Intersection of Two Arrays II",
      "Design HashMap", "Design HashSet", "Find Duplicate File in System", "Minimum Index Sum of Two Lists",
    ],
  },
  {
    topic: "Stack",
    gfg: "https://www.geeksforgeeks.org/stack-data-structure/",
    companies: ["Amazon", "Microsoft", "Google", "Oracle"],
    variants: "monotonic stack, expression stack, bracket matching, next greater element",
    problems: [
      "Valid Parentheses", "Min Stack", "Evaluate Reverse Polish Notation", "Daily Temperatures",
      "Car Fleet", "Largest Rectangle in Histogram", "Next Greater Element I", "Next Greater Element II",
      "Online Stock Span", "Remove K Digits", "Decode String", "Simplify Path", "Basic Calculator",
      "Basic Calculator II", "Asteroid Collision", "132 Pattern", "Validate Stack Sequences",
      "Remove All Adjacent Duplicates In String", "Remove Duplicate Letters", "Score of Parentheses",
    ],
  },
  {
    topic: "Binary Search",
    gfg: "https://www.geeksforgeeks.org/binary-search/",
    companies: ["Google", "Amazon", "Microsoft", "Facebook"],
    variants: "classic search, rotated search, lower bound, answer-space search",
    problems: [
      "Binary Search", "Search Insert Position", "First Bad Version", "Sqrtx", "Find Peak Element",
      "Search in Rotated Sorted Array", "Search in Rotated Sorted Array II", "Find Minimum in Rotated Sorted Array",
      "Find Minimum in Rotated Sorted Array II", "Search a 2D Matrix", "Search a 2D Matrix II",
      "Koko Eating Bananas", "Capacity To Ship Packages Within D Days", "Split Array Largest Sum",
      "Median of Two Sorted Arrays", "Find First and Last Position of Element in Sorted Array",
      "Time Based Key Value Store", "Peak Index in a Mountain Array", "Single Element in a Sorted Array",
      "Arranging Coins",
    ],
  },
  {
    topic: "Linked List",
    gfg: "https://www.geeksforgeeks.org/data-structures/linked-list/",
    companies: ["Amazon", "Microsoft", "Adobe", "PayPal"],
    variants: "reversal, merge, cycle, dummy node, fast-slow pointer",
    problems: [
      "Reverse Linked List", "Merge Two Sorted Lists", "Linked List Cycle", "Linked List Cycle II",
      "Remove Nth Node From End of List", "Reorder List", "Add Two Numbers", "Copy List with Random Pointer",
      "Merge K Sorted Lists", "Swap Nodes in Pairs", "Reverse Nodes in k Group", "Palindrome Linked List",
      "Intersection of Two Linked Lists", "Sort List", "Partition List", "Rotate List",
      "Remove Duplicates from Sorted List", "Remove Duplicates from Sorted List II", "Odd Even Linked List",
      "Design Linked List",
    ],
  },
  {
    topic: "Trees",
    gfg: "https://www.geeksforgeeks.org/binary-tree-data-structure/",
    companies: ["Amazon", "Google", "Microsoft", "Salesforce"],
    variants: "DFS, BFS, recursion, BST rules, path tracking, lowest common ancestor",
    problems: [
      "Invert Binary Tree", "Maximum Depth of Binary Tree", "Diameter of Binary Tree", "Balanced Binary Tree",
      "Same Tree", "Subtree of Another Tree", "Lowest Common Ancestor of a Binary Search Tree",
      "Binary Tree Level Order Traversal", "Binary Tree Right Side View", "Count Good Nodes in Binary Tree",
      "Validate Binary Search Tree", "Kth Smallest Element in a BST", "Construct Binary Tree from Preorder and Inorder Traversal",
      "Binary Tree Maximum Path Sum", "Serialize and Deserialize Binary Tree", "Path Sum", "Path Sum II",
      "Sum Root to Leaf Numbers", "Flatten Binary Tree to Linked List", "Populating Next Right Pointers in Each Node",
    ],
  },
  {
    topic: "Dynamic Programming",
    gfg: "https://www.geeksforgeeks.org/dynamic-programming/",
    companies: ["Google", "Amazon", "Microsoft", "ByteDance"],
    variants: "1D DP, 2D DP, knapsack, subsequence, grid, interval DP",
    problems: [
      "Climbing Stairs", "Min Cost Climbing Stairs", "House Robber", "House Robber II", "Longest Palindromic Substring",
      "Palindromic Substrings", "Decode Ways", "Coin Change", "Maximum Product Subarray", "Word Break",
      "Longest Increasing Subsequence", "Partition Equal Subset Sum", "Unique Paths", "Minimum Path Sum",
      "Longest Common Subsequence", "Best Time to Buy and Sell Stock with Cooldown", "Combination Sum IV",
      "Target Sum", "Edit Distance", "Burst Balloons",
    ],
  },
];

const leetcodeOverrides = {
  "Sqrtx": "sqrtx",
  "Two Sum II Input Array Is Sorted": "two-sum-ii-input-array-is-sorted",
};

const extraProblemsByTopic = {
  Arrays: ["Find Pivot Index", "Range Sum Query Immutable", "Summary Ranges", "Pascal Triangle", "Maximum Product of Three Numbers", "Third Maximum Number", "Degree of an Array", "Toeplitz Matrix", "Monotonic Array", "Squares of a Sorted Array"],
  Strings: ["Excel Sheet Column Title", "Add Binary", "Length of Last Word", "Repeated Substring Pattern", "Compare Version Numbers", "Zigzag Conversion", "Find the Index of the First Occurrence in a String", "Reverse String", "Reverse Vowels of a String", "Longest Valid Parentheses"],
  "Two Pointers": ["Minimum Difference Between Highest and Lowest of K Scores", "Reverse String", "Reverse Vowels of a String", "Is Subsequence", "Valid Word Abbreviation", "Sentence Similarity III", "Minimum Length of String After Deleting Similar Ends", "Append Characters to String to Make Subsequence", "Find K Closest Elements", "Minimum Moves to Equal Array Elements II"],
  "Sliding Window": ["Maximum Points You Can Obtain from Cards", "Contains Duplicate II", "Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit", "Maximize the Confusion of an Exam", "Minimum Number of Flips to Make the Binary String Alternating", "Longest Subarray of 1s After Deleting One Element", "Number of Subarrays of Size K and Average Greater Than or Equal to Threshold", "Maximum Erasure Value", "Frequency of the Most Frequent Element", "Count Vowel Substrings of a String"],
  Hashing: ["Unique Number of Occurrences", "Subdomain Visit Count", "Find Common Characters", "Pairs of Songs With Total Durations Divisible by 60", "Find the Difference", "Contains Duplicate II", "Longest Harmonious Subsequence", "Find Lucky Integer in an Array", "Check If N and Its Double Exist", "Maximum Number of Balloons"],
  Stack: ["Baseball Game", "Crawler Log Folder", "Final Prices With a Special Discount in a Shop", "Make The String Great", "Maximum Nesting Depth of the Parentheses", "Build an Array With Stack Operations", "Design Browser History", "Removing Stars From a String", "Number of Students Unable to Eat Lunch", "Exclusive Time of Functions"],
  "Binary Search": ["Guess Number Higher or Lower", "Valid Perfect Square", "Find Smallest Letter Greater Than Target", "Intersection of Two Arrays", "Two Sum II Input Array Is Sorted", "H-Index II", "Maximum Count of Positive Integer and Negative Integer", "Minimum Time to Complete Trips", "Successful Pairs of Spells and Potions", "Maximum Candies Allocated to K Children"],
  "Linked List": ["Delete Node in a Linked List", "Remove Linked List Elements", "Convert Binary Number in a Linked List to Integer", "Linked List Random Node", "Design Browser History", "Delete the Middle Node of a Linked List", "Swapping Nodes in a Linked List", "Remove Zero Sum Consecutive Nodes from Linked List", "Double a Number Represented as a Linked List", "Split Linked List in Parts"],
  Trees: ["Minimum Depth of Binary Tree", "Symmetric Tree", "Binary Tree Inorder Traversal", "Binary Tree Preorder Traversal", "Binary Tree Postorder Traversal", "Average of Levels in Binary Tree", "Minimum Absolute Difference in BST", "Range Sum of BST", "Leaf-Similar Trees", "Find Mode in Binary Search Tree"],
  "Dynamic Programming": ["N-th Tribonacci Number", "Counting Bits", "Divisor Game", "Pascal Triangle II", "Arithmetic Slices", "Delete and Earn", "Integer Break", "Perfect Squares", "Triangle", "Minimum Falling Path Sum"],
};

const expandedTopics = dsaTopics.map((topic) => ({
  ...topic,
  problems: [...topic.problems, ...(extraProblemsByTopic[topic.topic] || [])],
}));

const getProblemCompany = (topic, index) => topic.companies[index % topic.companies.length];

const allCompanies = Array.from(new Set(expandedTopics.flatMap((topic) => topic.companies))).sort((a, b) =>
  a.localeCompare(b)
);

const getLeetCodeUrl = (title) => {
  const slug = leetcodeOverrides[title] || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `https://leetcode.com/problems/${slug}/`;
};

function App() {
  const authModal = useRecoilValue(authModalState);
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [openTopics, setOpenTopics] = useState(() =>
    expandedTopics.reduce((acc, topic) => ({ ...acc, [topic.topic]: true }), {})
  );

  const filteredTopics = useMemo(() => {
    return expandedTopics
      .map((topic) => ({
        ...topic,
        problems:
          selectedCompany === "All"
            ? topic.problems
            : topic.problems.filter((_, index) => getProblemCompany(topic, index) === selectedCompany),
      }))
      .filter((topic) => topic.problems.length > 0);
  }, [selectedCompany]);

  const totalProblems = filteredTopics.reduce((sum, topic) => sum + topic.problems.length, 0);

  const toggleTopic = (topicName) => {
    setOpenTopics((previous) => ({ ...previous, [topicName]: !previous[topicName] }));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Navbar />

        <SharedHero
          eyebrow="DSA Roadmap"
          title="Learn DSA topic wise with LeetCode and GFG practice."
          description="Each topic has more practice problems, a GFG concept page, common company tags, and variant hints so you know what pattern to learn."
        >
          <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-dark-layer-1/80 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-400">Company filter</p>
              <p className="text-xl font-semibold">{selectedCompany === "All" ? "All companies" : selectedCompany}</p>
              <p className="mt-1 text-sm text-gray-400">{totalProblems} problems visible</p>
            </div>
            <select
              value={selectedCompany}
              onChange={(event) => setSelectedCompany(event.target.value)}
              className="rounded-lg border border-emerald-200 bg-emerald-300 px-4 py-3 font-semibold text-gray-950 outline-none ring-2 ring-emerald-500/40"
            >
              <option value="All">All companies</option>
              {allCompanies.map((company) => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>
        </SharedHero>

        <section className="space-y-6">
          {filteredTopics.map((topic) => (
            <article key={topic.topic} className="rounded-lg border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-md">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-bold">{topic.topic}</h2>
                    <span className="rounded bg-emerald-400 px-2 py-1 text-xs font-bold text-gray-950">{topic.problems.length} problems</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-300">Variants: {topic.variants}</p>
                  <p className="mt-1 text-sm text-gray-300">
                    {selectedCompany === "All" ? `Commonly asked by: ${topic.companies.join(", ")}` : `Asked by: ${selectedCompany}`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => toggleTopic(topic.topic)}
                    className="inline-flex shrink-0 items-center justify-center rounded-md bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                  >
                    {openTopics[topic.topic] ? "Close Problems" : "Open Problems"}
                  </button>
                  <a
                    href={topic.gfg}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center justify-center rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-gray-950 transition hover:bg-emerald-300"
                  >
                    GFG Topic Page
                  </a>
                </div>
              </div>

              {openTopics[topic.topic] && (
                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {topic.problems.map((title, index) => (
                    <a
                      key={`${topic.topic}-${title}`}
                      href={getLeetCodeUrl(title)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md bg-gray-950/35 px-4 py-3 text-sm text-gray-100 transition hover:bg-gray-950/60 hover:text-white"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold">{index + 1}. {title}</span>
                        <span className="shrink-0 text-xs text-pink-200">LeetCode</span>
                      </div>
                      <p className="mt-2 text-xs text-gray-400">
                        Asked by: {selectedCompany === "All" ? getProblemCompany(topic, index) : selectedCompany}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">Variants to learn: {topic.variants}</p>
                    </a>
                  ))}
                </div>
              )}
            </article>
          ))}
        </section>
      </div>
      {authModal.isOpen && <AuthModal />}
    </main>
  );
}

export default App;
