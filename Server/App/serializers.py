from rest_framework import serializers
from .models import Question, Clash, ClashParticipant, ClashSubmission, ClashResult, ClashHistory

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class ClashSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clash
        fields = '__all__'


class ClashParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClashParticipant
        fields = '__all__'


class ClashSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClashSubmission
        fields = '__all__'


class ClashResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClashResult
        fields = '__all__'


class ClashHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ClashHistory
        fields = '__all__'
