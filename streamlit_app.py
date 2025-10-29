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
/* 전체 최대 너비를 적당히 확장 (너무 크지 않게) */
.block-container {
    padding-top: 0.25rem;
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    padding-bottom: 0.25rem;
    max-width: 1400px; /* 과도한 폭 제거 */
}

/* 폰트/줄간격을 약간 작게 해서 한 화면에 더 많은 텍스트 표시 */
html, body, .stApp, .block-container {
    font-size: 13px !important;
    line-height: 1.05 !important;
}

/* 컴포넌트 여백 최소화 (과도하게 줄이지 않음) */
.element-container, .stMarkdown, .stButton, .stTextInput, .stSelectbox {
    margin: 0 !important;
    padding: 0.2rem !important;
}

/* 플롯/이미지 축소: 너무 작지 않게 적당히 */
img, svg, canvas {
    max-width: 100% !important;
    height: auto !important;
    transform-origin: 0 0;
    transform: scale(0.92); /* 약간 축소 */
}

/* iframe/내부 임베드 요소 스케일 및 오버플로우 처리 */
iframe[srcdoc], iframe {
    transform-origin: 0 0;
}

/* 헤더/사이드바 여백 최소화 */
header[data-testid="stHeader"], aside[aria-label="Sidebar"] {
    padding: 6px 12px !important;
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
      /* 내부 스크롤 제거, 내부 컨테이너 고정 높이/오버플로우 강제 해제 */
      html, body, #app, .container, .root, .content {
          overflow: visible !important;
          height: auto !important;
          max-height: none !important;
      }
      /* 내부 컨텐츠를 더 작게 축소하여 한 화면에 더 많은 내용 표시 */
      body { transform-origin: 0 0; transform: scale(0.75); -webkit-transform: scale(0.75); }
      /* 내부에서 고정된 width/height가 있으면 무시 */
      * { max-width: none !important; max-height: none !important; }
      /* 스크롤바 숨김 (선택) */
      ::-webkit-scrollbar { display: none; }
      body { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
    """
    # 위 스타일을 <head> 직후나 <body> 최상단에 삽입
    if '<head>' in html_with_inline:
        html_with_inline = html_with_inline.replace('<head>', '<head>' + injection_style)
    else:
        html_with_inline = injection_style + html_with_inline

    # --- 변경: HTML 길이에 따라 적정 높이 계산 (초기 화면에 맞춰 과도하게 커지지 않게 함) ---
    content_len = len(html_with_inline)
    line_count = html_with_inline.count('\n') + content_len / 200.0
    # 최소 900px, 최대 8000px 범위로 추정 (필요하면 범위 조정)
    estimated_height = int(min(max(900, line_count * 20), 8000))

    # 부모 페이지(스트림릿)에서 iframe과 블록의 높이/정렬을 추정값 기준으로 적용
    st.markdown(f"""
    <style>
    /* 블록을 가로 중앙 정렬하고, 내용 기반 최소 높이를 적용 */
    .block-container {{
        max-width: 1600px !important;
        padding: 0.3rem !important;
        margin: 0 auto !important; /* 가로 중앙 정렬 */
        min-height: {estimated_height}px !important; /* 콘텐츠 기반 최소 높이 */
    }}

    /* iframe을 중앙에 고정하고 높이를 콘텐츠 기반으로 설정 */
    iframe[srcdoc], iframe {{
        height: {estimated_height}px !important;
        width: 100% !important;
        max-width: 1600px !important;
        display: block;
        margin: 0 auto;
        border: none !important;
        overflow: visible !important;
    }}

    /* 부모 페이지 스크롤 동작 안정화 */
    .main > div[role="main"] {{ overflow: visible !important; display: block; }}

    /* 추가: 작은 화면에서 너무 크게 늘어나지 않도록 보정 */
    @media (max-width: 900px) {{
        .block-container {{ padding-left: 0.5rem !important; padding-right: 0.5rem !important; }}
        iframe[srcdoc], iframe {{ height: calc({estimated_height}px * 0.8) !important; }}
    }}
    </style>
    """, unsafe_allow_html=True)

    # Streamlit에서 HTML 컴포넌트 실행 - 추정 높이 사용
    components.html(
        html_with_inline,
        height=estimated_height,    # 내용 기반 높이
        width=1600,                 # 부모에서 max-width로 제한하므로 적당한 픽셀값 사용
        scrolling=False
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