\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{aa}[2026/05/22 Minimal local fallback for A&A-like documents]

\LoadClass[11pt,a4paper]{article}

\RequirePackage[margin=2.5cm]{geometry}
\RequirePackage{setspace}
\RequirePackage{authblk}
\RequirePackage{titling}
\RequirePackage{abstract}

\setstretch{1.08}
\setlength{\parindent}{1.1em}
\setlength{\parskip}{0.25em}

\newcommand{\subtitle}[1]{\gdef\@subtitle{#1}}
\newcommand{\@subtitle}{}

\renewcommand{\maketitle}{%
  \begin{center}
    {\LARGE\bfseries \thetitle\par}
    \vspace{0.4em}
    {\large \@subtitle\par}
    \vspace{1em}
    {\normalsize \theauthor\par}
    \vspace{0.4em}
    {\small \@date\par}
  \end{center}
  \vspace{1em}
}

\newcommand{\institute}[1]{\affil{#1}}

\renewcommand\abstract[5]{%
  \section*{Resumen}
  #1
  \par\medskip
  \textbf{Objetivo:} #2
  \par\smallskip
  \textbf{Métodos:} #3
  \par\smallskip
  \textbf{Resultados:} #4
  \par\smallskip
  \textbf{Conclusiones:} #5
  \par\medskip
}

\newcommand\keywords[1]{%
  \par\noindent\textbf{Palabras clave:} #1
  \par\medskip
}
