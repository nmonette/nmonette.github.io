# On Algorithmic Thinking

As a an early-undergrad student with poor mood regulation, I often wrote bad poetry as an outlet for whatever I had going on at the time. While it primarily was a way of managing my emotions, it also shined a light on how I think, and why I enjoy my research.

Many of the poems I've written are closely associated with a feeling and/or visual that I imagine or remember. At one point, some feelings of loneliness induced a mental image of spiders living in a place that had not been properly tended to in a long time. The following poem came from this line of thinking, alongside an emotionally-charged 3am trip to the beach:

<div style="border: 5px solid grey; background-color: black; color: white; padding: 20px; padding-block: 0px; text-align: center; max-width: 500px; margin: 0 auto;">
  <i>
  
it’s the worst in the dark
right before i go to sleep
i feel this spider crawling up my leg

cobwebs in my sheets
spun in your absence
with a little glisten
from the streetlamp outside my window

there’s always just enough light
to cast your shadow 

the beach
where i sought an escape
from your influence

sitting in the
the good moments 
that remain in my mind

the waves ahead of me
sew my memories together
with dirty water
    
</i>
</div>

Of course, I was not well at the time but in retrospect this pattern was very illuminating as to how I process certain types of information! While I may have had  a hard time directly putting how I was feeling into words, the visual representations I had created in my head were able to somewhat convey the ideas. An analogue is that my neural representation learning had compressed the emotional information to include mostly vision-related features.

After some deliberation, it became clear to me that (like my poetry) many of the algorithms that we work with in computer science come with visual intuition. A great example of this is one of my favorite game theoretic algorithms, [Double Oracle](https://www.cs.cmu.edu/~ggordon/mcmahan-ggordon-blum.icml2003.pdf) (DO).

DO and its more well-known generalization [PSRO](https://arxiv.org/pdf/1711.00832) are often described as creating a growing population of strategies to solve a given game, and then the job of DO/PSRO is essentially to figure out a "meta-strategy" for how to select the different strategies. It can be visualized abstractly as follows:
<center>
<img src="/double_oracle.png"  style="max-width: 100%; height: auto;">
</center>

To me, this idea is not particularly complicated, but I think this is largely because the algorithms have a very clear visual representation: progressively adding a row and column to a matrix for each iteration of the algorithm, where this matrix represents a lookup-table for the pairwise outcomes of each meta-strategy. For a game like rock-paper-scissors, such a "payoff matrix" for the "column player" would look like this **(click on the videos to see the animation)**:

<center>
  <video
    src="/animations_for_blog/payoff_table.mp4"
    muted
    playsinline
    preload="metadata"
    style="width: 100%; max-width: 800px; aspect-ratio: 16 / 9; display: block; margin: 0 auto; background: black;">
  </video>
</center>

Namely, when the row player plays rock and the column player plays paper, the column player would win, so the column player's "payoff" would be $1$.

For each iteration of DO, the agents need to add their best response to the opponent's meta-strategy. To walk through the steps, we first would start with both players having just $R$ (rock) as their possible strategies. In this case, each player would then find the best possible improved action (best response): $P$ (paper)! Upon expanding the matrix, each player then needs to find the best-responding action to the  __Nash Equilibrium__ (NE) strategy of their opponent (with the limited set of actions). 

The optimal strategy for each agent in this case is to always play the second action, so each agent would then play $P$ (paper) with 100% probability. Finally, in order to beat paper, both agents would add $S$ (scissors) to their repetoires, and thus would complete the payoff matrix, where one can then use their favorite min-max optimization technique to solve the NE of the 3-action game. I've visualized this procedure here:

<center>
  <video
    src="/animations_for_blog/double_oracle.mp4"
    muted
    playsinline
    preload="metadata"
    style="width: 100%; max-width: 800px; aspect-ratio: 16 / 9; display: block; margin: 0 auto; background: black;">
  </video>
</center>


This may seem a bit useless, as we essentially took a bunch of extra steps to recover an already-known payoff matrix and ended up needing to solve the full game anyways. However, in (even infinitely) large games, we do not necessarily need to "acquire" all of the possible actions to compute an appproximate NE!

Later on, I read a paper that used DO for [solving infinite games](https://proceedings.mlr.press/v195/assos23a/assos23a.pdf)! One preliminary thought that came up for me was that DO was not intuitively useful for games with infinitely many actions. Moreover, the logic behind doing so is shrouded behind a bunch of learning theory and combinatorics that is quite intimidating! However, there (yet again!) is a great [visual intuition for this](https://www.mit.edu/~gfarina/6S890_f23/lecture19.pdf):


<div style="border: 5px solid grey; background-color: black; color: white; padding: 20px; padding-block: 0px; text-align: center; max-width: 750px; margin: 0 auto;">
  <i>
For games with infinitely many actions, the NE cannot exist if there are infinite-dimensional portions of the payoff-matrix which resemble the game "Guess the Larger Number." 
</i>
</div>

Essentially, this can be interpreted as saying that if the DO procedure cannot terminate, there must not exist a NE. In a more visual sense, it is saying that our blue boxes from above cannot continue to grow indefinitely. To me at least, the formal mathematical machinery necessary to prove this is not something that I can quickly understand. However, the visual intuition provides accessibility to these concepts in a way that i find quite __poetic!__ I've also visualized the non-termination case of "Guess the Larger Number" here:

<center>
  <video
    src="/animations_for_blog/guess.mp4"
    muted
    playsinline
    preload="metadata"
    style="width: 100%; max-width: 800px; aspect-ratio: 16 / 9; display: block; margin: 0 auto; background: black;">
  </video>
</center>

This sort of intuition is incompatible with some concepts, like deep learning phenomena that only emerge in [very high dimensions](https://arxiv.org/pdf/2201.02177). However, us humans develop with intuitions of the (low-dimensional) physical world, and I believe these intuitions can guide a greater understanding of otherwise very difficult concepts. 