---
title: "Beyond Adversarial Training: A Robust Counterpart Approach to HSVM"
link: https://hackernoon.com/beyond-adversarial-training-a-robust-counterpart-approach-to-hsvm?source=rss
author: Hyperbole
publish_date: 2026-01-18 17:00:03
saved_date: 2026-01-19 07:02:53
image: https://hackernoon.com/https://cdn.hackernoon.com/images/a-large-student-hall-with-students-studying-sketch-color-yfkzqvcgt2agnowsbwg1gieu.png
tags: #deep-learning #robust-hyperbolic-svm #data-feature-uncertainty #counterpart-optimization #hsvm-sdp-relaxation #sparse-moment-relaxation #non-convex-qcqp-solving #minkowski-product-robustness
---

![image](https://hackernoon.com/https://cdn.hackernoon.com/images/a-large-student-hall-with-students-studying-sketch-color-yfkzqvcgt2agnowsbwg1gieu.png)

## Table of Links

[Abstract and 1. Introduction](http://hackernoon.com/preview/PPQY8DYTOzZv1zRdBIHK)

2.  [Related Works](http://hackernoon.com/preview/jJWYubVQPSoGqeJeUZjT)
    
3.  Convex Relaxation Techniques for Hyperbolic SVMs
    
    [3.1 Preliminaries](http://hackernoon.com/preview/hwOqqby6EaqyyZDBkGbr)
    
    [3.2 Original Formulation of the HSVM](http://hackernoon.com/preview/1Y77UhGcmiKAOuwSrhSj)
    
    [3.3 Semidefinite Formulation](http://hackernoon.com/preview/Wy26h1k2dOP7cmunKxtG)
    
    [3.4 Moment-Sum-of-Squares Relaxation](http://hackernoon.com/preview/L6FBQuYoxSwCW0HQd2wi)
    
4.  [Experiments](http://hackernoon.com/preview/PHbYZt9kMTeKD9h5dU5H)
    
    [4.1 Synthetic Dataset](https://hackernoon.com/preview/feGa6hRU5qz8S0HLfHz8)
    
    [4.2 Real Dataset](https://hackernoon.com/preview/B58Pht5W1gciYW5R4Vk0)
    
5.  [Discussions, Acknowledgements, and References](https://hackernoon.com/preview/OqnI3jHvi3Pajul6fKKL)
    
    \\
    

[A. Proofs](https://hackernoon.com/preview/11celdcRxYRdnkVjAYtA)

[B. Solution Extraction in Relaxed Formulation](http://hackernoon.com/preview/pfZ1deStnpDUsJSH08Ku)

[C. On Moment Sum-of-Squares Relaxation Hierarchy](http://hackernoon.com/preview/LQCalZqUuRIaqLHYIjkU)

[D. Platt Scaling \[31\]](http://hackernoon.com/preview/GFPlVim8IyxpWGBn1Oew)

[E. Detailed Experimental Results](http://hackernoon.com/preview/H8Z32RKzgXCIpA7GRGBD)

[F. Robust Hyperbolic Support Vector Machine](https://hackernoon.com/preview/4sS4zUCRIKZvBUKdt3mD)

## F Robust Hyperbolic Support Vector Machine

In this section, we propose the robust version of hyperbolic support vector machine without implemention. This is different from the practice of adversarial training that searches for adversarial samples on the fly used in the machine learning community, such as Weber et al. \[7\]. Rather, we predefine an uncertainty structure for data features and attempt to write down the corresponding optimization formulation, which we call the robust counterpart, as described in \[42, 43\].

\\ ![](https://cdn.hackernoon.com/images/null-78032dy.png)

\\ ![](https://cdn.hackernoon.com/images/null-cb132ed.png)

\\ Then, by adding the uncertainty set to the constraints, we have

\\ ![](https://cdn.hackernoon.com/images/null-q9232i5.png)

\\ where the last step is a rewriting into the robust counterpart (RC). We present the 𝑙∞ norm bounded robust HSVM as follows,

\\ ![](https://cdn.hackernoon.com/images/null-ez332nd.png)

\\ Note that since 𝑦𝑖 ∈ {−1, 1}, we may drop the 𝑦𝑖 term in the norm and subsequently write down the SDP relaxation to this non-convex QCQP problem and solve it efficiently with

\\ ![](https://cdn.hackernoon.com/images/null-m5432y9.png)

\\ For the implementation in MOSEK, we linearize the 𝑙1 norm term by introducing extra auxiliary variables, which we do not show here. The moment relaxation can be implemented likewise, since this is constraint-wise uncertainty and we preserve the same sparsity pattern so that the same sparse moment relaxation applies.

\\ ![](https://cdn.hackernoon.com/images/null-pp532q9.png)

\\

:::info **Authors:**

(1) Sheng Yang, John A. Paulson School of Engineering and Applied Sciences, Harvard University, Cambridge, MA (shengyang@g.harvard.edu);

(2) Peihan Liu, John A. Paulson School of Engineering and Applied Sciences, Harvard University, Cambridge, MA (peihanliu@fas.harvard.edu);

(3) Cengiz Pehlevan, John A. Paulson School of Engineering and Applied Sciences, Harvard University, Cambridge, MA, Center for Brain Science, Harvard University, Cambridge, MA, and Kempner Institute for the Study of Natural and Artificial Intelligence, Harvard University, Cambridge, MA (cpehlevan@seas.harvard.edu).

:::

* * *

:::info This paper is **[available on arxiv](https://arxiv.org/abs/2405.17198)** under CC by-SA 4.0 Deed (Attribution-Sharealike 4.0 International) license.

:::

\\