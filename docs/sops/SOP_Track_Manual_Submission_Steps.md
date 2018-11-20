#SOP Track Manual Submission Steps

	git remote add origin https://ikostadi@colab.mpi-bremen.de/stash/scm/gfbio/submissions.git
	git push --set-upstream origin master:$(readlink -f . | rev | cut -d '/' -f 1 | rev)
	git config push.default current
