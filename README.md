# 이차방정식 계산기 (Quadratic Equation Solver)

ax² + bx + c = 0 형태의 이차방정식을 풀어주는 Python 프로그램입니다.

## 기능
- 이차방정식의 계수 입력
- 판별식 계산
- 해의 종류 판별 (서로 다른 두 실근, 중근, 복소수 해)
- 해 계산 및 출력

## 폴더 구조
```
quadratic_equation/
├── README.md
├── src/
│   ├── quadratic_solver.py    # 이차방정식 계산 클래스
│   └── main.py               # 메인 실행 파일
└── tests/
    └── test_quadratic_solver.py  # 테스트 코드
```

## 사용법

### 1. 프로그램 실행
```bash
cd src
python main.py
```

### 2. 테스트 실행
```bash
cd tests
python test_quadratic_solver.py
```

## 예시
```
입력: a=1, b=-5, c=6
출력: x₁=3, x₂=2

입력: a=1, b=-4, c=4  
출력: x=2 (중근)

입력: a=1, b=0, c=1
출력: x₁=i, x₂=-i (복소수 해)
```