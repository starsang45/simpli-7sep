def missing_number(nums):
    n = len(nums)
    number_map = {}

    # 배열의 모든 숫자를 딕셔너리에 추가
    for num in nums:
        number_map[num] = True

    # 0부터 n까지의 숫자 중 딕셔너리에 없는 숫자를 찾기
    for i in range(n + 1):
        if i not in number_map:
            return i

# 테스트 케이스
nums1 = [3, 0, 1]
nums2 = [0, 1]
nums3 = [9, 6, 4, 2, 3, 5, 7, 0, 1]

print(f"Missing number in [3, 0, 1]: {missing_number(nums1)}")  # Output: 2
print(f"Missing number in [0, 1]: {missing_number(nums2)}")     # Output: 2
print(f"Missing number in [9, 6, 4, 2, 3, 5, 7, 0, 1]: {missing_number(nums3)}")  # Output: 8
