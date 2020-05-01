import json

from rest_framework import status, mixins, generics
from rest_framework.response import Response

from gfbio_submissions.generic.models import RequestLog
from gfbio_submissions.generic.serializers import JiraRequestLogSerializer


class JiraIssueUpdate(mixins.CreateModelMixin, generics.GenericAPIView):
    serializer_class = JiraRequestLogSerializer

    # def perform_create(self, serializer):
    #     serializer.save(issue=self.request.data)
    #     # try:
    #     #     print(type(self.request.data))
    #     #     print(str(self.request.data))
    #     #     data = json.dumps(self.request.data)
    #     #     print(data)
    #     # except ValueError as e:
    #     #     print(e)
    #     #     # response["error"] = str(e)
    #     #     # return Response(response, status=status.HTTP_400_BAD_REQUEST)
    #
    #     serializer.save(
    #         type=RequestLog.INCOMING,
    #         url=self.request.get_full_path(),
    #         data=json.dumps(self.request.data) if isinstance(self.request.data, dict) else self.request.data,
    #         response_status=status.HTTP_201_CREATED,
    #         request_details={'host': self.request.get_host()}
    #     )

    def create(self, request, *args, **kwargs):
        print('CREATE')
        serializer = self.get_serializer(data=request.data)
        is_valid = serializer.is_valid()
        print('valid ', is_valid)

        details = {
            'serializer_errors': serializer.errors
        }


        RequestLog.objects.create(
            type=RequestLog.INCOMING,
            data=json.dumps(request.data) if isinstance(
                request.data, dict) else request.data,
            response_status=status.HTTP_201_CREATED if is_valid else status.HTTP_400_BAD_REQUEST,
            request_details=details
        )

        # print('self. request', self.request)
        # print('data', request.data)
        # print(serializer.validated_data)
        # print(serializer.errors)

        print('\n----- before serializer with exceptipn true\n')
        serializer.is_valid(raise_exception=True)

        # ----- works if invalid, if valid code below has demands

        obj = self.perform_create(serializer)

        headers = self.get_success_headers(serializer.data)
        data_content = dict(serializer.data)
        # data_content = dict(serializer.data)
        # data_content.pop('submission', 0)
        # data_content['id'] = obj.pk
        # data_content['broker_submission_id'] = sub.broker_submission_id

        return Response(data_content, status=status.HTTP_201_CREATED,
                        headers=headers)
        # super(JiraIssueUpdate, self).create(self, request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        print('POST ..')
        return self.create(request, *args, **kwargs)
