+++
title = "The Possibility of a Randomly Generated Program"
description =  ""
tags = ["random"]
categories = ["other"]
date = 2019-05-27T16:53:45-04:00
draft = true
+++

I got bored today and started thinking about the possibility of randomly generating a
valid computer program.
<!--more-->

If in the future when somebody actually created a program that can be called
artificial general intelligence, it is very likely such program was created through
some sort of continuous evolution. Since humans are the only known AGI and we emerged
through billions of years of evolution. Even if we were designed by higher-beings,
there exists a lot of evidence for some sort of evolution process.

This reasoning present me a question to the current programming paradigms. There is
no way of evolving a human created software (neural networks will be discussed later)
into anything better or worse. That is because executable programs exist in a
non-linear space. For example, consider the statement "x = y + 1", the adjacent programs
in the space of all programs are probably something like "a = y + 1" or even
"x ( y + 1" and they do not make any sense. If we formalize this process,
assume there is a mapping between f(z) -> program where z is some latent vector.
"f(z + epsilon)" is very unlikely to be a valid program. When a program is created
by a software engineer, we have "f(AGI(env)) -> f(z) -> program", where AGI is the
engineer and env is the quantum state of the universe. In the next step, we have
f(AGI(env + epsilon) -> f(AGI(env')) -> f(z') -> program), although env and env' are very closely linked
by the rule of the universe, there is no mathematical model that can describe the
transformation from z to z'. The reason is that AGI is already the most fundamental
way to describe the mapping, there is no statistical or analytical model simpler than
AGI that can explain z -> z'. Any model that approximate the transform is guaranteed to be worse than AGI in everything else.

This perfectly explains why current machine learning based model is stuck in the
uncanny valley. Because we are trying to learn the function 'f' from latent
vector z and z', which will yield a mathematically simple but unintelligent model
that can approximate the transformation. Further extend this theory, any machine
learning or evolutionary system wll learn the most primitive unintelligent mapping.
Learning function 'f' will never result in the 'AGI' function, but if we can
solve the 'AGI' function, mapping for 'f' or 'z' is not needed at all.

Everything above are my mindless rants, they probably don't really make sense.
Here, I present a basic random program generator that generates program.

```python
import random
import ast
import subprocess

keywords = ['and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'exec', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'not', 'or', 'pass', 'print', 'raise', 'return', 'try', 'while', 'with', 'yield']
operators = ['+', '-', '*', '/', '.', '(', ')']
tokens = ['0', '1', 'x']
others = ["'", '"', ' ', '\n']


def gen():
    all_tokens = keywords + operators + tokens + others
    outputs = ""
    for i in range(5):
        t = random.choice(all_tokens)
        outputs += t
    try:
        a = ast.parse(outputs)
        code = compile(a, '', 'exec')
        exec(code)
    except:
        pass
    else:
        print(outputs)
        open("out.py", 'w').write(outputs)
        output = subprocess.check_output("python3 out.py", shell=True)
        if len(output):
            print('it worked!', output)
            return True
    return False

while not gen():
    continue
```

It is pretty straight forward and not surprisingly, it really created an executable
program. Here is the first program created by this monstrosity.

```python
print(exec
)
```

```python
# output
it worked! b'<built-in function exec>\n'
```

I predict that an intelligent system must not only be able to continuously evolve itself (like gradient descent modifying the weights), it can also modify the algorithm that modify itself (gradient descent cannot). On top of that, it must be able to modify itself at runtime (traditional programs can but neural net cannot).

