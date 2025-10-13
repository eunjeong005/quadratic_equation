"""
이차방정식 해결 프로그램
ax² + bx + c = 0 형태의 이차방정식을 풀어주는 프로그램
"""

import math

class QuadraticSolver:
    def __init__(self, a, b, c):
        """
        이차방정식 ax² + bx + c = 0의 계수를 초기화
        
        Args:
            a (float): x²의 계수 (0이 아니어야 함)
            b (float): x의 계수
            c (float): 상수항
        """
        if a == 0:
            raise ValueError("a는 0이 될 수 없습니다. 이차방정식이 아닙니다.")
        
        self.a = a
        self.b = b
        self.c = c
    
    def calculate_discriminant(self):
        """판별식 D = b² - 4ac를 계산"""
        return self.b ** 2 - 4 * self.a * self.c
    
    def solve(self):
        """
        이차방정식의 해를 구함
        
        Returns:
            tuple: (해의 개수, 해들의 리스트)
        """
        discriminant = self.calculate_discriminant()
        
        if discriminant > 0:
            # 서로 다른 두 실근
            x1 = (-self.b + math.sqrt(discriminant)) / (2 * self.a)
            x2 = (-self.b - math.sqrt(discriminant)) / (2 * self.a)
            return (2, [x1, x2])
        
        elif discriminant == 0:
            # 중근
            x = -self.b / (2 * self.a)
            return (1, [x])
        
        else:
            # 복소수 해
            real_part = -self.b / (2 * self.a)
            imaginary_part = math.sqrt(-discriminant) / (2 * self.a)
            x1 = complex(real_part, imaginary_part)
            x2 = complex(real_part, -imaginary_part)
            return (2, [x1, x2])
    
    def get_equation_string(self):
        """방정식을 문자열로 표현"""
        return f"{self.a}x² + {self.b}x + {self.c} = 0"
    
    def get_solution_info(self):
        """해에 대한 자세한 정보를 반환"""
        discriminant = self.calculate_discriminant()
        solution_count, solutions = self.solve()
        
        info = {
            'equation': self.get_equation_string(),
            'discriminant': discriminant,
            'solution_count': solution_count,
            'solutions': solutions
        }
        
        if discriminant > 0:
            info['type'] = '서로 다른 두 실근'
        elif discriminant == 0:
            info['type'] = '중근'
        else:
            info['type'] = '복소수 해'
        
        return info