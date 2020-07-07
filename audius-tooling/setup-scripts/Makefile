main:
	echo "Please select a valid option"

init-repos:
	sh setup-shell-scripts/init-repos.sh

dockerhub-build-and-tag:
	sh setup-shell-scripts/dockerhub-build-and-tag.sh ${service} ${tag}

push-to-ecr:
	sh setup-shell-scripts/push-to-ecr.sh ${tag} ${service} ${latestOrProd}