import streamlit as st
import streamlit.components.v1 as components
import os
import re

# 페이지 설정 - 컴팩트한 레이아웃
st.set_page_config(
    page_title="이차함수 완전제곱식 & 그래프 변환 학습",
    page_icon="🎯",
    layout="wide",  # 변경: centered -> wide
    initial_sidebar_state="collapsed"
)

# 강제 업데이트 트리거 (v1.1)
st.markdown("<!-- Force Update v1.1 -->", unsafe_allow_html=True)

# 사이드바에 정보 추가
st.sidebar.title("📚 이차함수 학습 도우미")
st.sidebar.markdown("""
### 🎯 학습 목표
- 완전제곱식 변환 연습
- 그래프 평행이동 이해
- 이차함수와 그래프의 관계 파악

### 📖 사용법
1. **Level 1**: x² + bx + c 형태
2. **Level 2**: ax² + bx + c 형태

### 🔧 기능
- 랜덤 문제 생성
- 단계별 피드백
- 인터랙티브 그래프
""")

# 컴팩트한 메인 타이틀
st.title("🎯 이차함수 완전제곱식 & 그래프 변환 학습")

# 페이지 폭을 넓히고 여백을 줄이는 전역 CSS
st.markdown("""
<style>
/* 전체 최대 너비를 화면 전체로 더 확장 */
.block-container {
    padding-top: 0.15rem;
    padding-right: 0.25rem;
    padding-left: 0.25rem;
    padding-bottom: 0.15rem;
    max-width: 3200px; /* 크게 확장 */
}

/* 폰트/줄간격을 더 작게 해서 한 화면에 더 많은 텍스트 표시 */
html, body, .stApp, .block-container {
    font-size: 12px !important;
    line-height: 1.0 !important;
}

/* 컴포넌트 여백 최소화 */
.element-container, .stMarkdown, .stButton, .stTextInput, .stSelectbox {
    margin: 0 !important;
    padding: 0.12rem !important;
}

/* 플롯/이미지 등 미디어 축소 */
img, svg, canvas {
    max-width: 100% !important;
    height: auto !important;
    transform-origin: 0 0;
    transform: scale(0.80); /* 더 작게 축소해서 한 화면에 더 많이 보이게 함 */
}

/* iframe/내부 임베드 요소 스케일 및 오버플로우 처리 */
iframe[srcdoc], iframe {
    transform-origin: 0 0;
}

/* 헤더/사이드바 여백 최소화 */
header[data-testid="stHeader"], aside[aria-label="Sidebar"] {
    padding: 4px 8px !important;
}

/* 추가 줄간격/마진 제거 */
h1, h2, h3, p, li, label { margin: 0; padding: 0; }

/* 부모 페이지가 내부 컨텐츠 전체를 스크롤하게 강제 */
.main > div[role="main"] { overflow: visible !important; }
</style>
""", unsafe_allow_html=True)

# HTML, CSS, JavaScript 파일 읽기
try:
    # HTML 파일 읽기
    with open('index.html', 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # CSS 파일 읽기
    with open('src/style.css', 'r', encoding='utf-8') as f:
        css_content = f.read()
    
    # JavaScript 파일 읽기
    with open('src/script.js', 'r', encoding='utf-8') as f:
        js_content = f.read()
    
    # 최종적으로 CSS/JS를 인라인으로 삽입
    html_with_inline = html_content.replace(
        '<link rel="stylesheet" href="src/style.css">',
        f'<style>{css_content}</style>'
    ).replace(
        '<script src="src/script.js"></script>',
        f'<script>{js_content}</script>'
    )

    # iframe 내부에서 스크롤을 없애고 전체 내용을 보여주기 위한 추가 스타일
    injection_style = """
    <style>
      html, body { overflow: visible !important; height: auto !important; }
      ::-webkit-scrollbar { display: none; }
      body { -ms-overflow-style: none; scrollbar-width: none; }
      /* 내부 컨텐츠 축소 비율을 더 키움(더 많은 내용 표시) */
      body { transform-origin: 0 0; transform: scale(0.80); }
      /* 내부 요소가 큰 경우 전체가 보이도록 최대 너비 제한 완화 */
      .container, #app { max-width: none !important; width: auto !important; }
    </style>
    """
    # 위 스타일을 <head> 직후나 <body> 최상단에 삽입
    if '<head>' in html_with_inline:
        html_with_inline = html_with_inline.replace('<head>', '<head>' + injection_style)
    else:
        html_with_inline = injection_style + html_with_inline

    # 부모 페이지(스트림릿)에서 iframe을 충분히 크게 보이게 하는 전역 CSS
    st.markdown("""
    <style>
    /* Streamlit이 생성한 iframe에 대해 매우 큰 최소 높이/너비 확보 */
    iframe[srcdoc], iframe {
        min-height: 7000px !important;  /* 크게 늘림: 필요하면 더 키우세요 */
        height: auto !important;
        width: 100% !important;
        border: none !important;
        overflow: visible !important;
    }
    .main > div[role="main"] { overflow: visible !important; }
    </style>
    """, unsafe_allow_html=True)

    # Streamlit에서 HTML 컴포넌트 실행 - height를 매우 크게 잡아 부모 페이지에서 바로 전체를 스크롤
    components.html(
        html_with_inline,
        height=7000,    # 변경: 매우 크게(한 화면에 더 많은 내용 표시). 필요시 9000 등으로 더 늘리세요.
        width=2800,     # 넓이도 더 크게 설정
        scrolling=False  # 내부 스크롤을 끄고 부모 페이지가 스크롤하게 함
    )
    
except FileNotFoundError as e:
    st.error(f"파일을 찾을 수 없습니다: {e}")
    st.info("현재 디렉토리의 파일들을 확인해주세요.")
    
    # 디버깅을 위한 파일 목록 표시
    if st.checkbox("파일 목록 보기"):
        current_files = []
        for root, dirs, files in os.walk('.'):
            for file in files:
                current_files.append(os.path.join(root, file))
        
        st.write("현재 디렉토리의 파일들:")
        for file in sorted(current_files):
            st.write(f"- {file}")

# 컴팩트한 푸터
st.markdown("""
<div style='text-align: center; color: #666; padding: 10px;'>
    <p>🎓 이차함수 학습 프로그램 v1.0</p>
</div>
""", unsafe_allow_html=True)