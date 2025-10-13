"""
QuadraticSolver 클래스의 테스트 코드
"""

import unittest
import sys
import os

# src 폴더의 모듈을 import하기 위해 경로 추가
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from quadratic_solver import QuadraticSolver

class TestQuadraticSolver(unittest.TestCase):
    
    def test_discriminant_positive(self):
        """서로 다른 두 실근을 가지는 경우 테스트"""
        solver = QuadraticSolver(1, -5, 6)  # x² - 5x + 6 = 0
        discriminant = solver.calculate_discriminant()
        self.assertEqual(discriminant, 1)  # (-5)² - 4*1*6 = 25 - 24 = 1
        
        solution_count, solutions = solver.solve()
        self.assertEqual(solution_count, 2)
        self.assertAlmostEqual(solutions[0], 3.0)
        self.assertAlmostEqual(solutions[1], 2.0)
    
    def test_discriminant_zero(self):
        """중근을 가지는 경우 테스트"""
        solver = QuadraticSolver(1, -4, 4)  # x² - 4x + 4 = 0
        discriminant = solver.calculate_discriminant()
        self.assertEqual(discriminant, 0)  # (-4)² - 4*1*4 = 16 - 16 = 0
        
        solution_count, solutions = solver.solve()
        self.assertEqual(solution_count, 1)
        self.assertAlmostEqual(solutions[0], 2.0)
    
    def test_discriminant_negative(self):
        """복소수 해를 가지는 경우 테스트"""
        solver = QuadraticSolver(1, 0, 1)  # x² + 1 = 0
        discriminant = solver.calculate_discriminant()
        self.assertEqual(discriminant, -4)  # 0² - 4*1*1 = -4
        
        solution_count, solutions = solver.solve()
        self.assertEqual(solution_count, 2)
        self.assertEqual(solutions[0], complex(0, 1))
        self.assertEqual(solutions[1], complex(0, -1))
    
    def test_invalid_a_coefficient(self):
        """a가 0일 때 예외 발생 테스트"""
        with self.assertRaises(ValueError):
            QuadraticSolver(0, 1, 1)
    
    def test_equation_string(self):
        """방정식 문자열 표현 테스트"""
        solver = QuadraticSolver(2, -3, 1)
        equation = solver.get_equation_string()
        self.assertEqual(equation, "2x² + -3x + 1 = 0")

if __name__ == '__main__':
    unittest.main()