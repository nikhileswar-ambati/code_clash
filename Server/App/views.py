from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Question, Clash, ClashParticipant, ClashSubmission, ClashResult, ClashHistory
from .serializers import QuestionSerializer, ClashSerializer, ClashParticipantSerializer, ClashSubmissionSerializer, ClashResultSerializer, ClashHistorySerializer
from rest_framework import viewsets
from api.judge0_calls import get_languages, get_submission_token, check_submission_status,compile_code
from api.gemini_api_calls import generate_hints, ask_ai


class GetLanguagesView(APIView):
    def get(self, request):
        return Response(get_languages())

class CompileCodeView(APIView):
    def post(self, request):
        source_code = request.data.get("source_code")
        lang_id = request.data.get("language_id")
        testcases = request.data.get("testcases")
        return Response(compile_code(source_code,lang_id,testcases))


class GenerateHintsView(APIView):
    def post(self, request):
        data = request.data
        response = generate_hints(data)
        return Response({"response": response})
        

class AskAIView(APIView):
    def post(self, request):
        data = request.data
        response = ask_ai(data)
        return Response({"response": response})




# ViewSet for the Question model
class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

class ClashViewSet(viewsets.ModelViewSet):
    queryset = Clash.objects.all()
    serializer_class = ClashSerializer
    lookup_field = 'clash_id'


class ClashParticipantViewSet(viewsets.ModelViewSet):
    queryset = ClashParticipant.objects.all()
    serializer_class = ClashParticipantSerializer


class ClashSubmissionViewSet(viewsets.ModelViewSet):
    queryset = ClashSubmission.objects.all()
    serializer_class = ClashSubmissionSerializer


class ClashResultViewSet(viewsets.ModelViewSet):
    queryset = ClashResult.objects.all()
    serializer_class = ClashResultSerializer


class ClashHistoryViewSet(viewsets.ModelViewSet):
    queryset = ClashHistory.objects.all()
    serializer_class = ClashHistorySerializer
