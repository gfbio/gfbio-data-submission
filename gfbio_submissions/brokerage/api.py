import json

from rest_framework import status, mixins, generics
from rest_framework.response import Response

from gfbio_submissions.generic.models import RequestLog
from gfbio_submissions.generic.serializers import JiraHookRequestSerializer


class JiraIssueUpdate(mixins.CreateModelMixin, generics.GenericAPIView):
    serializer_class = JiraHookRequestSerializer

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
        # print('valid ', is_valid)

        details = {
            'serializer_errors': serializer.errors
        }

        # FIXME: if serializer below throws  excetption than all is rolled back and no
        #   Requestlog is create . maybe a requestlog on error is not possible, at least not witout manual code
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

        # print('\n----- before serializer with exceptipn true\n')
        headers = self.get_success_headers(serializer.data)

        if not is_valid:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST,
                            headers=headers)
        # serializer.is_valid(raise_exception=True)

        # ----- works if invalid, if valid code below has demands

        obj = self.perform_create(serializer)

        data_content = dict(serializer.data)
        # data_content = dict(serializer.data)
        # data_content.pop('submission', 0)
        # data_content['id'] = obj.pk
        # data_content['broker_submission_id'] = sub.broker_submission_id
        print('create before return ')
        return Response(data_content, status=status.HTTP_201_CREATED,
                        headers=headers)
        # super(JiraIssueUpdate, self).create(self, request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        print('POST ..')
        response = self.create(request, *args, **kwargs)
        # print('response', response.__dict__)
        # print('before return ')
        return response
