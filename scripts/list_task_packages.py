# -*- coding: utf-8 -*-
import pathlib
from pprint import pprint

SKIP = ['__init__.py', 'submission_task.py', ]


def list_brokerage_task_packages():
    brokerage_tasks_dir = pathlib.Path('../gfbio_submissions/brokerage/tasks/')
    packages = []
    for p in brokerage_tasks_dir.rglob('*.py'):
        if set(p.parts).isdisjoint(SKIP):
            parts = p.parts
            package_string = '\'' + '.'.join(list(parts)[1:]).strip('.py') + '\''
            packages.append(package_string)
    print('[')
    for pg in packages:
        print('    ', pg, ',')
    print(']')


def main():
    list_brokerage_task_packages()


if __name__ == "__main__":
    main()
