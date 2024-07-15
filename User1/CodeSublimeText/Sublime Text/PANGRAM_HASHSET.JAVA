import java.util.HashSet;
import java.util.Set;

public class Solution {
    public boolean checkIfPangram(String sentence) {
        Set<Character> uniqueLetters = new HashSet<>();
        
        // Iterate through the sentence and add each character to the set
        for (char c : sentence.toCharArray()) {
            uniqueLetters.add(c);
        }
        
        // If the set contains 26 unique letters, it is a pangram
        return uniqueLetters.size() == 26;
    }

    public static void main(String[] args) {
        Solution solution = new Solution();
        
        // Example 1
        String sentence1 = "thequickbrownfoxjumpsoverthelazydog";
        System.out.println(solution.checkIfPangram(sentence1)); // 출력: true
        
        // Example 2
        String sentence2 = "leetcode";
        System.out.println(solution.checkIfPangram(sentence2)); // 출력: false
    }
}
