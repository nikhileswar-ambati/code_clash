from django.contrib import admin

from .models import Clash, ClashHistory, ClashParticipant, ClashResult, ClashSubmission, Question


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('question_id', 'title', 'difficulty', 'topics', 'time_limit_per_test')
    search_fields = ('title', 'topics')


admin.site.register(Clash)
admin.site.register(ClashParticipant)
admin.site.register(ClashSubmission)
admin.site.register(ClashResult)
admin.site.register(ClashHistory)