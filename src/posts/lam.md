# What Do We Really Want from Latent Action Models?
In light of recent results on otherwise quite challenging benchmarks for tabula rasa RL agents like Craftax [@creus_roger_2026_gpt6] and NetHack [@bergquist2026llmnethack], one clear way of seeing emergent performance in these tasks is to perform large scale multi-modal pretraining, as has been done with the modern Large Language Model [@radford_improving_2018]. However, in settings such as robotics, we simply just don't have access to an analogous internet-scale dataset **with action annotations**. 

One solution to this problem is to use *latent actions* as our pretraining objective [@ye2025latent]. Latent actions are a learned representation that has the *idea* of an action behind it, perhaps analogous to the relationship between a LaCroix sparkling water and grapefruit. There have been a number of works proposing ways to imitate from action-less data, which generally can be called *Latent Action Models* or LAMs [@pmlr-v97-edwards19a; @schmidt2024learning; @pmlr-v267-nikulin25a].

LAMs attack what appears to be a very challenging problem: 
>Can we extract **unsupervised** representations of an action purely from visual representations?

### What are Latent Action Models?

In the sense of LAPO [@schmidt2024learning], the LAM is an autoencoder architecture, which jointly an inverse dynamics model (IDM) into a forward dynamics model (FDM). With $o$ meaning observation and $a$ meaning action, we get:
$$
f_{IDM}: \mathcal{O} \times \mathcal{O} \to \mathcal{A} \\
(o_t, o_{t+1}) \mapsto a_t,
$$
and:
$$
f_{FDM}: \mathcal{O} \times \mathcal{A} \to \mathcal{O} \\
(o_t, a_t) \mapsto o_{t+1},
$$
thus giving us the LAPO forward pass:
$$
\hat{a}_{t} = f_{IDM}(o_t, o_{t+1})  \\
\hat{o}_{t+1} = f_{FDM}(o_t, \hat{a_t}) \\
\min_{f} ||\hat{o}_{t+1} - o_{t+1} ||_2^2.
$$

In the end, we really just care about passing the dataset through the IDM. In order to get to the point where that actually works, however, we need $\hat{a}_{t}$ to be heavily **compressed**. In the words of [@schmidt2024learning, p. 2]:
> "By making the latent action an information bottleneck [...], we prevent the IDM from simply forwarding the entire future observation to the FDM, thereby forcing it to learn a highly compressed encoding of state transitions"

With the downstream goal of being able to perform action-free pretraining, we particularly need a model which can compress the state transition **so much** that there is hardly any information left about the observation itself (or at least relative to the action). 

### Testing LAPO for Pretraining
The goal of pretraining is to provide a prior distribution over task behavior, so that we can finetune the model more efficiently to some set of tasks. If our latent actions are mostly compressed observations, we may find it impossible to actually measure if our pretraining has produced a helpful prior! Specifically, if we predict a latent action and then train an action "head" on top of this, the action head will simply be a behavior cloning policy. In order to even score our pretraining, we need the latent action to be a good predictor of the true action, but a bad predictor of the observations.

To test this, I implemented LAPO, and trained it on a balanced mixture of 7 robotic manipulation subsets of the Open X-Embodiment Dataset [@vuong2023open].  In order to compare predictability, we use a normalized MSE-type metric that we are calling "prediction skill." We define prediction skill with data mean $\mu$, which gives us $\text{skill} = 1 - \frac{MSE(\hat{a}_t, a_t)}{MSE(\mu, a_t)}$. However, note that instead of minimizing, we want the skill to be as close to $1.0$ as possible. We train 3 MLPs per dataset to take the latent action and predict $a_t$, $o_t$, or $o_{t+1}$, and compare how well they predict each quantity via prediction skill:

![Skill comparison](/lam_openx_discrete_unsup_large.png)

*Figure 1: Observation and action predictability on different OpenX datasets without action supervision.*

Our latents predict the observations and not the action, so our results really have the appearance that we did not squeeze our observations through a small enough information bottleneck. I think this may be what draws the most criticism about LAMs, because modifying the size of the information bottleneck in order to turn compressed observations into actions feels much more like magic than a science. So naturally, I tried reducing the size of the codebook so that the information bottleneck was even smaller:

![Skill comparison](/lam_openx_discrete_unsup_small.png)

*Figure 2: Observation and action predictability on different OpenX datasets without action supervision, this time with a smaller information bottleneck.*

In this case, we observe that things are just kind of bad, with low skill across the board. Action predictability has mildly improved, but is still far too close to $0.0$. I'm not necessarily trying to make a generalized claim about how well the information bottleneck extracts actions, however I don't think that technique is sufficient in this case. After a bit of desperation, I checked what would happen if we added auxiliary prediction from latent action to ground truth action (i.e. action supervision), as it is heavily suggested by LAOM [@pmlr-v267-nikulin25a]: 

![Skill comparison](/lam_openx_discrete_sup.png)

*Figure 3: Observation and action predictability on different OpenX datasets with action supervision.*

Perhaps most interestingly, we can see that some subsets of Open X-Embodiment display the properties that we want much more than the others! This could be a data curation issue; however I did at least put some care into balancing the datasets for training (i.e. they all have the same number of trajectories present in the dataset). I am not even really sure what qualities these datasets possess that cause them to lead to such poor latents!

There is a growing literature on augmentations and other tricks to improve the action-predictability of LAMs [@pmlr-v267-nikulin25a; @zhang2025what; @rudolph2026principled; @bu2026laofrobustlatentaction]. However, even under **ground-truth** action supervision, the LAM fails to produce action-predicting latents for some datasets! Accordingly I would like to stress that as a community we have some work to do in order to unlock larger scale pretraining for robotics.

### Concluding Statements

LAMs are a really neat idea. Anecdotally I've observed a lot of skepticism towards them, and I think it's completely understandable given the problem setting has only really been made well-defined retroactively by @zhang2025what. Even more so, given the "well-defined" problem setting, it still sort of sounds insane!

I do believe that if we were able to get latent action models to perform well on e.g. human data, we would be able to perform robotics pretraining at unprecedented scale. However, because people aren't just wearing motion capture suits everywhere they go, I haven't yet seen a convincing and tractable metric that we could use to actually verify if such a latent action model works on such data. Beyond not having a tractable metric to optimize for, perhaps the better question is if this is the right route for achieving greater pretraining scale.

### Thanks for reading!

P.S. I've included my code [here](https://github.com/nmonette/lam_pretraining).