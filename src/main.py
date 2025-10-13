"""
이차방정식 프로그램의 메인 실행 파일
사용자와 상호작용하여 이차방정식을 입력받고 해를 출력
"""

from quadratic_solver import QuadraticSolver

def main():
    print("=== 이차방정식 계산기 ===")
    print("ax² + bx + c = 0 형태의 이차방정식을 풀어드립니다.")
    print()
    
    try:
        # 계수 입력받기
        print("계수를 입력해주세요:")
        a = float(input("a (x²의 계수): "))
        b = float(input("b (x의 계수): "))
        c = float(input("c (상수항): "))
        
        # 이차방정식 해결
        solver = QuadraticSolver(a, b, c)
        solution_info = solver.get_solution_info()
        
        # 결과 출력
        print("\n=== 결과 ===")
        print(f"방정식: {solution_info['equation']}")
        print(f"판별식 D = {solution_info['discriminant']}")
        print(f"해의 성질: {solution_info['type']}")
        print(f"해의 개수: {solution_info['solution_count']}")
        
        print("해:")
        if solution_info['solution_count'] == 1:
            print(f"  x = {solution_info['solutions'][0]}")
        else:
            for i, solution in enumerate(solution_info['solutions'], 1):
                print(f"  x{i} = {solution}")
    
    except ValueError as e:
        print(f"오류: {e}")
    except Exception as e:
        print(f"예상치 못한 오류가 발생했습니다: {e}")

if __name__ == "__main__":
    main()